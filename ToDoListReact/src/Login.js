import * as React from 'react';
import TextField from '@mui/material/TextField';
import { Stack } from '@mui/material';
import Button from '@mui/material/Button';
import { useState } from 'react';
import service from './service';
import { useNavigate } from 'react-router-dom';
const Login = () => {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({ userName: false, password: false });
    const navigate = useNavigate();
    const handleLogin = async () => {
        // קריאה לפונקציה login של service
        await service.login(userName, password, navigate);
    };
        const handleSignIn = () => {
            const newErrors = {
                userName: userName.trim() === "",
                password: password.trim() === "",
            };
            setErrors(newErrors);
            if (!newErrors.userName && !newErrors.password) {
                handleLogin();
                setUserName("");
                setPassword("");
            }
        };
        const handleSignUp = () => {
            navigate("/register");
        }
        const handleUserNameChange = (e) => {
            const value = e.target.value;
            setUserName(value);

            if (value.trim() !== "") {
                setErrors((prev) => ({ ...prev, userName: false }));
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
                        onChange={(e) => handleUserNameChange(e)} />
                    <div></div>
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
                        onChange={(e) => handlePasswordChange(e)} />
                    <div></div>
                    <Button variant="contained" onClick={handleSignIn}>Sign in</Button>
                    <div></div>
                    <Button variant="contained" onClick={handleSignUp}>Sign up</Button>
                </Stack>
            </>
        );
    };

    export default Login;
