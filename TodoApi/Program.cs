using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TodoApi;

var builder = WebApplication.CreateBuilder(args);

// הוספת שירות CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// הוספת שירותי Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // הוספת הגדרת עמודה עבור ה-JWT ב-Swagger UI
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header
    });

    // הוספת אובייקט אבטחה לכלל ה-endpoints שדורשים JWT
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});
//הוספת DbContext עם חיבור ל-MySQL
builder.Services.AddDbContext<ToDoDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("ToDoDB"),
        Microsoft.EntityFrameworkCore.ServerVersion.Parse("8.0.40-mysql")
    ));

// הוספת הזדהות JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    var jwtSettings = builder.Configuration.GetSection("Jwt");

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.GetValue<string>("Issuer"),
        ValidAudience = jwtSettings.GetValue<string>("Audience"),
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.GetValue<string>("Key")))
    };
});

builder.Services.AddAuthorization();
var app = builder.Build();

app.UseCors("AllowAll");

//if (app.Environment.IsDevelopment())

    app.UseSwagger();
    app.UseSwaggerUI();


app.UseAuthentication();
app.UseAuthorization();

// פונקציה ליצירת טוקן JWT
string GenerateJwtToken(string username, string email, int userId)
{
    var claims = new[]
    {
        new Claim(ClaimTypes.Name, username),
        new Claim(ClaimTypes.Email, email),
        new Claim(ClaimTypes.Role, "User"),
        new Claim(ClaimTypes.NameIdentifier, userId.ToString()) // הוספת מזהה המשתמש
    };
    var jwtSettings = builder.Configuration.GetSection("Jwt");
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.GetValue<string>("Key")));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    var token = new JwtSecurityToken(
        issuer: jwtSettings.GetValue<string>("Issuer"),
        audience: jwtSettings.GetValue<string>("Audience"),
        claims: claims,
        expires: DateTime.Now.AddMinutes(30),
        signingCredentials: creds);

    return new JwtSecurityTokenHandler().WriteToken(token);
}

// רישום משתמש חדש
app.MapPost("/register", async (RegisterDto registerDto, ToDoDbContext context) =>
{
    if (await context.Users.AnyAsync(u => u.UserName == registerDto.UserName))
    {
        return Results.BadRequest("User already exists.");
    }

    context.Users.Add(new User { UserName = registerDto.UserName,Mail=registerDto.Mail, Password = registerDto.Password });
    await context.SaveChangesAsync();
    return Results.Ok("User registered successfully.");
});

// כניסה וקבלת טוקן
app.MapPost("/login", async (LoginDto LoginUser, ToDoDbContext context) =>
{
    var user = await context.Users.FirstOrDefaultAsync(u => u.UserName == LoginUser.UserName && u.Password == LoginUser.Password);
    if (user == null)
    {
        return Results.Json(new { message = "Invalid username or password." }, statusCode: StatusCodes.Status401Unauthorized);
    }

    var token = GenerateJwtToken(LoginUser.UserName,user.Mail,user.Id);
    return Results.Ok(new { token });
});


// Endpoints מוגנים
app.MapGet("/",()=>"server is running");
// הצגת כל המשימות של המשתמש המחובר
app.MapGet("/tasks", async (ClaimsPrincipal user, ToDoDbContext context) =>
{
    var userId = GetUserIdFromClaims(user);
    if (userId == null) return Results.Unauthorized();

    var tasks = await context.Items.Where(item => item.UserId == userId).ToListAsync();
    return Results.Ok(tasks);
}).RequireAuthorization();

// הצגת משימה לפי ID למשתמש המחובר
app.MapGet("/tasks/{id}", async (int id, ClaimsPrincipal user, ToDoDbContext context) =>
{
    var userId = GetUserIdFromClaims(user);
    if (userId == null) return Results.Unauthorized();

    var task = await context.Items.FirstOrDefaultAsync(item => item.Id == id && item.UserId == userId);
    return task != null ? Results.Ok(task) : Results.NotFound();
}).RequireAuthorization();

app.MapPost("/tasks", async (ItemDto taskDto, ClaimsPrincipal user, ToDoDbContext context) =>
{
    var userId = GetUserIdFromClaims(user); // קח את ה- userId מה-Claims
    if (userId == null) return Results.Unauthorized();

    var task = new Item
    {
        Name = taskDto.Name,
        IsComplete = taskDto.IsComplete,
        UserId = userId.Value
    };  // הוסף את ה- userId למטלה
    context.Items.Add(task);     // הוסף את המטלה לבסיס הנתונים
    await context.SaveChangesAsync(); // שמור את המטלה
    return Results.Created($"/tasks/{task.Id}", task); // שלח את התשובה עם המטלה
}).RequireAuthorization();


// עדכון משימה קיימת של המשתמש המחובר
app.MapPut("/tasks/{id}", async (int id, ItemDto updatedItem, ClaimsPrincipal user, ToDoDbContext context) =>
{
    var userId = GetUserIdFromClaims(user);
    if (userId == null) return Results.Unauthorized();

    var task = await context.Items.FirstOrDefaultAsync(item => item.Id == id && item.UserId == userId);
    if (task == null) return Results.NotFound($"Task with ID {id} not found.");

    task.IsComplete = updatedItem.IsComplete;
    await context.SaveChangesAsync();
    return Results.Ok(task);
}).RequireAuthorization();

// מחיקת משימה של המשתמש המחובר
app.MapDelete("/tasks/{id}", async (int id, ClaimsPrincipal user, ToDoDbContext context) =>
{
    var userId = GetUserIdFromClaims(user);
    if (userId == null) return Results.Unauthorized();

    var task = await context.Items.FirstOrDefaultAsync(item => item.Id == id && item.UserId == userId);
    if (task == null) return Results.NotFound($"Task with ID {id} not found.");

    context.Items.Remove(task);
    await context.SaveChangesAsync();
    return Results.Ok(task);
}).RequireAuthorization();

app.Run();

int? GetUserIdFromClaims(ClaimsPrincipal user)
{
    var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
    return userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId) ? userId : null;
}

app.Run();
