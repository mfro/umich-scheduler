import SchedulePage_Center from '@/components/SchedulePage/Center.vue';
import SchedulePage_Sidebar from '@/components/SchedulePage/Sidebar.vue';

import GeneratedSchedules_Center from '@/components/GeneratedSchedules/Center.vue';
import GeneratedSchedules_Sidebar from '@/components/GeneratedSchedules/Sidebar.vue';

export default [
    {
        path: '/schedules/generated',
        components: { 
            default: GeneratedSchedules_Center,
            sidebar: GeneratedSchedules_Sidebar,
        },
    },
    {
        path: '/schedules/:id',
        components: { 
            default: SchedulePage_Center,
            sidebar: SchedulePage_Sidebar,
        },
        props: true,
    },
    {
        path: '*',
        redirect: '/schedules/generated'
    }
];
