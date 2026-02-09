import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ServiceGroupsList from './ServiceGroupsList';
import ServiceItemsList from './ServiceItemsList';

const Services = () => {
  const managementTabs = [
    { key: 'groups', label: 'Service Groups' },
    { key: 'items', label: 'Service Items' }
  ];
  
  const [selectedManagementIndex, setSelectedManagementIndex] = useState(0);

  return (
    <div className="w-full px-4 py-8">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <h1 className="lg:text-[40px] text-[36px] text-black font-bold lg:mb-[60px] mb-8 text-center">
        Services
      </h1>

      {/* Management Tabs */}
      <Tab.Group selectedIndex={selectedManagementIndex} onChange={setSelectedManagementIndex}>
        <Tab.List className="flex space-x-2 bg-gray-100 rounded-lg p-1 mb-6 max-w-md mx-auto">
          {managementTabs.map((tab) => (
            <Tab
              key={tab.key}
              className={({ selected }) =>
                `flex-1 px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors ${
                  selected
                    ? 'bg-white text-black shadow'
                    : 'text-gray-600 hover:text-gray-800'
                }`
              }
            >
              {tab.label}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          {/* Service Groups Panel */}
          <Tab.Panel>
            <ServiceGroupsList />
          </Tab.Panel>
          
          {/* Service Items Panel */}
          <Tab.Panel>
            <ServiceItemsList />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default Services;
