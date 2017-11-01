export default interface Section {
    term: string;
    session: string;
    academicGroup: string;
    id: number;
    subject: string;

    courseId: number;
    sectionId: number;

    title: string;
    component: string;
    flags: string;

    days: string[]
    startDate: string;
    endDate: string;
    time: string;
    location: string;
    instructor: string;
    credits: string;
}