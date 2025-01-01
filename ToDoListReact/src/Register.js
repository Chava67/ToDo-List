import * as React from 'react';
import TextField from '@mui/material/TextField';
import { Stack } from '@mui/material';
import Button from '@mui/material/Button';
import { useState } from 'react';
import service from './service';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ userName: false, email: false, password: false });
  const navigate = useNavigate();

  const handleRegister = async () => {
    console.log('Registering...');
    await service.register(userName, email, password);
    console.log('Registration complete');
    navigate("/");
  };
  
  const handleSignUp = () => {
    const newErrors = {
      userName: userName.trim() === "",
      email: email.trim() === "",
      password: password.trim() === "",
    };

    setErrors(newErrors);

    if (!newErrors.userName && !newErrors.email && !newErrors.password) {
      handleRegister()
      alert("Signed Up successfully!");
      setUserName("");
      setEmail("");
      setPassword("");
    }
  };

  const handleUserNameChange = (e) => {
    const value = e.target.value;
    setUserName(value);

    if (value.trim() !== "") {
      setErrors((prev) => ({ ...prev, userName: false }));
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (value.trim() !== "") {
      setErrors((prev) => ({ ...prev, email: false }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    if (value.trim() !== "") {
      setErrors((prev) => ({ ...prev, password: false }));
    }
  };

  return (
    <>
       <Stack
                component="form"
                sx={{
                    width: '40ch',
                }}
                spacing={2}
                noValidate
                autoComplete="off"
                marginTop={20}
                marginLeft={18}>
        <TextField
          sx={{ marginBottom: "10px" }}
          required
          id="outlined-required"
          label="Enter user name"
          value={userName}
          error={errors.userName}
          helperText={errors.userName ? "User name is required" : ""}
          onChange={handleUserNameChange}
        />
        <TextField
          sx={{ marginBottom: "10px" }}
          required
          id="outlined-required"
          label="Enter Email"
          value={email}
          error={errors.email}
          helperText={errors.email ? "Email is required" : ""}
          onChange={handleEmailChange}
        />
        <TextField
          sx={{ marginBottom: "10px" }}
          required
          id="outlined-password-input"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          error={errors.password}
          helperText={errors.password ? "Password is required" : ""}
          onChange={handlePasswordChange}
        />
        <Button variant="contained" onClick={handleSignUp}>
          Sign up
        </Button>
        </Stack>
      
    </>
  );
};

export default Register;
