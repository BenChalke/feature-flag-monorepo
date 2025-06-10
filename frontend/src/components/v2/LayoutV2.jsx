import React, { useState, createContext } from 'react';
import SidebarV2 from './SideBarV2';
import TopBarV2 from './TopBarV2';

// Context so any child can read the current environment (lowercase)
export const EnvContext = createContext('Development');

export default function LayoutV2({ children, onAddFlagClick }) {
  const [currentEnv, setCurrentEnv] = useState('Development');

  return (
    <EnvContext.Provider value={currentEnv}>
      <div className="flex">
        {/* Sidebar: sticky full viewport height */}
        <div className="sticky top-0 h-screen">
          <SidebarV2
            activeEnv={currentEnv}
            onChange={setCurrentEnv}
          />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="sticky top-0 z-20 bg-white dark:bg-gray-800">
            <TopBarV2
              onAddFlagClick={() => onAddFlagClick(currentEnv)}
              currentEnv={currentEnv}
            />
          </div>

          {/* Content flows and uses body scroll */}
          <main className="flex-1 bg-gray-50 dark:bg-gray-900 p-6">
            {children}
          </main>
        </div>
      </div>
    </EnvContext.Provider>
  );
}
