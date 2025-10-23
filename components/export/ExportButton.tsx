import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Image as ImageIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import ExportPanel from './ExportPanel';
import { exportService } from '../../services/exportService';

interface ExportButtonProps {
  dashboardElementId: string;
  data?: any;
  title?: string;
  variant?: 'button' | 'menu';
  size?: 'small' | 'medium' | 'large';
}

const ExportButton: React.FC<ExportButtonProps> = ({
  dashboardElementId,
  data,
  title = 'Dashboard',
  variant = 'button',
  size = 'medium'
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [exportPanelOpen, setExportPanelOpen] = useState(false);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleQuickExport = async (format: 'pdf' | 'excel' | 'png') => {
    handleMenuClose();
    
    try {
      switch (format) {
        case 'pdf':
          await exportService.exportToPDF(dashboardElementId, {
            filename: `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
          });
          break;
        case 'excel':
          if (data) {
            await exportService.exportToExcel(data, {
              filename: `${title.toLowerCase().replace(/\s+/g, '-')}-data-${new Date().toISOString().split('T')[0]}.xlsx`
            });
          }
          break;
        case 'png':
          await exportService.exportChartAsImage(dashboardElementId, 'png', {
            filename: `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.png`
          });
          break;
      }
    } catch (error) {
      console.error('Quick export failed:', error);
    }
  };

  const handlePrint = () => {
    handleMenuClose();
    exportService.preparePrintVersion(dashboardElementId);
  };

  const handleAdvancedExport = () => {
    handleMenuClose();
    setExportPanelOpen(true);
  };

  if (variant === 'button') {
    return (
      <>
        <Tooltip title="Export Dashboard">
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleMenuClick}
            size={size}
          >
            Export
          </Button>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={() => handleQuickExport('pdf')}>
            <ListItemIcon>
              <PdfIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export as PDF</ListItemText>
          </MenuItem>

          {data && (
            <MenuItem onClick={() => handleQuickExport('excel')}>
              <ListItemIcon>
                <ExcelIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Export as Excel</ListItemText>
            </MenuItem>
          )}

          <MenuItem onClick={() => handleQuickExport('png')}>
            <ListItemIcon>
              <ImageIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export as Image</ListItemText>
          </MenuItem>

          <Divider />

          <MenuItem onClick={handlePrint}>
            <ListItemIcon>
              <PrintIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Print</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleAdvancedExport}>
            <ListItemIcon>
              <EmailIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Advanced Export & Share</ListItemText>
          </MenuItem>
        </Menu>

        <ExportPanel
          open={exportPanelOpen}
          onClose={() => setExportPanelOpen(false)}
          dashboardElementId={dashboardElementId}
          data={data}
          title={title}
        />
      </>
    );
  }

  // Menu variant - just the icon button
  return (
    <>
      <Tooltip title="Export Options">
        <Button
          variant="text"
          onClick={handleMenuClick}
          size={size}
          sx={{ minWidth: 'auto', p: 1 }}
        >
          <MoreIcon />
        </Button>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleQuickExport('pdf')}>
          <ListItemIcon>
            <PdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>PDF</ListItemText>
        </MenuItem>

        {data && (
          <MenuItem onClick={() => handleQuickExport('excel')}>
            <ListItemIcon>
              <ExcelIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Excel</ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={() => handleQuickExport('png')}>
          <ListItemIcon>
            <ImageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Image</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handlePrint}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Print</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleAdvancedExport}>
          <ListItemIcon>
            <EmailIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
      </Menu>

      <ExportPanel
        open={exportPanelOpen}
        onClose={() => setExportPanelOpen(false)}
        dashboardElementId={dashboardElementId}
        data={data}
        title={title}
      />
    </>
  );
};

export default ExportButton;