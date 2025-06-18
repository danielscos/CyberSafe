import {
  BrandTitle,
  SidebarSectionTitle,
  SidebarButton,
} from './StyledComponents';
import { SIDEBAR_TOOLS, SIDEBAR_RESOURCES } from '../constants';

const Sidebar = ({ activeTab, onTabChange }) => {
  const handleResourceClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <aside className="sidebar-glass" role="navigation" aria-label="Main navigation">
      <BrandTitle component="h1">
        CyberSafe
      </BrandTitle>

      <div className="sidebar-section">
        <SidebarSectionTitle component="h2">
          TOOLS
        </SidebarSectionTitle>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {SIDEBAR_TOOLS.map((tool) => (
            <SidebarButton
              key={tool.id}
              active={activeTab === tool.id}
              onClick={() => onTabChange(tool.id)}
              role="button"
              tabIndex={0}
              aria-current={activeTab === tool.id ? 'page' : undefined}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onTabChange(tool.id);
                }
              }}
            >
              <span className="icon" role="img" aria-label={`${tool.label} icon`}>
                {tool.icon}
              </span>
              {tool.label}
            </SidebarButton>
          ))}
        </ul>
      </div>

      <div className="sidebar-section">
        <SidebarSectionTitle component="h2">
          RESOURCES
        </SidebarSectionTitle>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {SIDEBAR_RESOURCES.map((resource) => (
            <SidebarButton
              key={resource.id}
              onClick={() => handleResourceClick(resource.url)}
              role="button"
              tabIndex={0}
              aria-label={`Open ${resource.label} in new tab`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleResourceClick(resource.url);
                }
              }}
            >
              <span className="icon" role="img" aria-label={`${resource.label} icon`}>
                {resource.icon}
              </span>
              {resource.label}
            </SidebarButton>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
