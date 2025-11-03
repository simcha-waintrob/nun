import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Avatar
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import PaymentIcon from '@mui/icons-material/Payment';
import ReportsIcon from '@mui/icons-material/Assessment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AccountIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSynagogue } from '../contexts/SynagogueContext';
import { useAdmin, UserRole } from '../contexts/AdminContext';

interface NavigationProps {
  signOut?: () => void;
  user?: any;
}

const Navigation: React.FC<NavigationProps> = ({ signOut, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentSynagogue } = useSynagogue();
  const { userRole, currentUser, synagogues } = useAdmin();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  
  // Get current synagogue logo
  const currentSynagogueData = synagogues.find(s => s.id === currentSynagogue?.id);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    handleClose();
    if (signOut) {
      signOut();
    }
  };

  const getMenuItems = () => {
    const baseItems = [
      { path: '/', label: 'דשבורד', icon: <HomeIcon /> },
      { path: '/congregants', label: 'מתפללים', icon: <PeopleIcon /> },
      { path: '/events', label: 'אירועים', icon: <EventIcon /> },
      { path: '/payments', label: 'תשלומים', icon: <PaymentIcon /> },
      { path: '/reports', label: 'דוחות', icon: <ReportsIcon /> }
    ];

    const adminItems = [];
    
    // Add admin menu for synagogue admins
    if (userRole === UserRole.ADMIN) {
      adminItems.push({
        path: '/admin',
        label: 'ניהול בית הכנסת',
        icon: <AdminPanelSettingsIcon />
      });
    }
    
    // Add super admin menu for system administrators
    if (userRole === UserRole.SUPER_ADMIN) {
      adminItems.push(
        {
          path: '/super-admin',
          label: 'ניהול מערכת',
          icon: <SupervisorAccountIcon />
        },
        {
          path: '/admin',
          label: 'ניהול בית הכנסת',
          icon: <AdminPanelSettingsIcon />
        }
      );
    }

    return [...baseItems, ...adminItems];
  };

  const menuItems = getMenuItems();

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          {currentSynagogueData?.logoUrl && (
            <Avatar
              src={currentSynagogueData.logoUrl}
              alt={currentSynagogueData.hebrewName}
              sx={{ width: 32, height: 32, mr: 2 }}
            />
          )}
          <Typography variant="h6" component="div">
            {currentSynagogue?.name || 'מערכת ניהול נדרים ונדבות'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {menuItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ ml: 2 }}>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {currentUser?.name || 'משתמש'}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {currentUser?.email || user?.attributes?.email || ''}
                </Typography>
                <Typography variant="caption" color="primary" display="block">
                  {userRole === UserRole.SUPER_ADMIN ? 'מנהל על' : 
                   userRole === UserRole.ADMIN ? 'מנהל בית כנסת' : 'משתמש'}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleSignOut}>
              <LogoutIcon sx={{ mr: 1 }} />
              יציאה
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
