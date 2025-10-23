import React from 'react';
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  AccountCircle,
  Settings,
  Logout,
  MoreVert,
} from '@mui/icons-material';

interface UserProfileProps {
  collapsed?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ collapsed = false }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (collapsed) {
    return (
      <Box
        sx={{
          p: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <IconButton onClick={handleClick} size="small">
          <Avatar sx={{ width: 32, height: 32 }}>
            <AccountCircle />
          </Avatar>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem>
            <AccountCircle sx={{ mr: 1 }} />
            Profile
          </MenuItem>
          <MenuItem>
            <Settings sx={{ mr: 1 }} />
            Settings
          </MenuItem>
          <Divider />
          <MenuItem>
            <Logout sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: 'auto',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
            <AccountCircle />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>
              John Doe
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              Business Analyst
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={handleClick}>
          <MoreVert />
        </IconButton>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem>
          <AccountCircle sx={{ mr: 1 }} />
          Profile
        </MenuItem>
        <MenuItem>
          <Settings sx={{ mr: 1 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem>
          <Logout sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserProfile;