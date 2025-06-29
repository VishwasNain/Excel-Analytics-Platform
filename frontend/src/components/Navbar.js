import React from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle as AccountIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';

const Navbar = ({ isAuthenticated, onLogout }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Excel Analysis Platform
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Button color="inherit">Dashboard</Button>
              </Link>
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={onLogout}
              >
                Logout
              </Button>
              <IconButton color="inherit">
                <Badge badgeContent={0} color="secondary">
                  <AccountIcon />
                </Badge>
              </IconButton>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Button color="inherit">Login</Button>
              </Link>
              <Link to="/register" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Button color="inherit">Register</Button>
              </Link>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
