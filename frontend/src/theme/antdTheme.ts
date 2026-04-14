import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#4F6EF7',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    borderRadius: 10,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    colorBgLayout: '#F4F6FD',
    colorBorder: '#E5EAFF',
    boxShadow:
      '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.04)',
    boxShadowSecondary: '0 4px 16px 0 rgba(79,110,247,0.12)',
  },
  components: {
    Layout: {
      headerBg: '#FFFFFF',
      bodyBg: '#F4F6FD',
    },
    Menu: {
      horizontalItemSelectedColor: '#4F6EF7',
      horizontalItemHoverColor: '#4F6EF7',
      itemSelectedColor: '#4F6EF7',
      itemHoverColor: '#4F6EF7',
      activeBarHeight: 2,
    },
    Card: {
      borderRadiusLG: 12,
      boxShadowTertiary:
        '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
    },
    Button: {
      borderRadius: 8,
      primaryShadow: '0 2px 8px rgba(79,110,247,0.25)',
    },
    Input: {
      borderRadius: 8,
    },
    Select: {
      borderRadius: 8,
    },
    Steps: {
      colorPrimary: '#4F6EF7',
    },
  },
};
