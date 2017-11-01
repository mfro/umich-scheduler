import SchedulePage from '@/components/SchedulePage.vue';
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
        path: '/schedules/:name',
        component: SchedulePage,
        props: true,
    },
    {
        path: '*',
        redirect: '/schedules/generated'
    }
];
