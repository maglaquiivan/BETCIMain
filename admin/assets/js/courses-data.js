/* ============================================
   SHARED COURSES DATA
   Used by both Admin and Trainee dashboards
   ============================================ */

// Get courses from localStorage or use default data
function getCoursesData() {
    const stored = localStorage.getItem('betci_courses');
    if (stored) {
        return JSON.parse(stored);
    }
    
    // Default courses
    return [
        {
            id: 1,
            title: 'Forklift Operation NC II',
            description: 'Master forklift operation, safety protocols, and material handling techniques for industrial and warehouse environments.',
            image: '../../assets/img/fork.png',
            level: 'NC II',
            duration: 40,
            status: 'active'
        },
        {
            id: 2,
            title: 'Bulldozer Operation NC II',
            description: 'Learn bulldozer operation, earthmoving techniques, and site preparation for construction and mining projects.',
            image: '../../assets/img/bulldozer.png',
            level: 'NC II',
            duration: 40,
            status: 'active'
        },
        {
            id: 3,
            title: 'Dump Truck Operation NC II',
            description: 'Professional training for rigid on-highway dump truck operation, hauling, and transportation safety.',
            image: '../../assets/img/dump truck.png',
            level: 'NC II',
            duration: 40,
            status: 'active'
        },
        {
            id: 4,
            title: 'Hydraulic Excavator NC II',
            description: 'Advanced excavator operation, digging techniques, and hydraulic system maintenance for construction sites.',
            image: '../../assets/img/hydraulic excavator.png',
            level: 'NC II',
            duration: 40,
            status: 'active'
        },
        {
            id: 5,
            title: 'Wheel Loader NC II',
            description: 'Comprehensive wheel loader training, material handling, and loading techniques for various applications.',
            image: '../../assets/img/logo.png',
            level: 'NC II',
            duration: 40,
            status: 'active'
        },
        {
            id: 6,
            title: 'Backhoe Loader NC II',
            description: 'Master backhoe loader operation, digging, trenching, and utility work for construction projects.',
            image: '../../assets/img/logo.png',
            level: 'NC II',
            duration: 40,
            status: 'active'
        }
    ];
}

// Save courses to localStorage
function saveCoursesData(courses) {
    localStorage.setItem('betci_courses', JSON.stringify(courses));
}

// Add new course
function addCourseData(courseData) {
    const courses = getCoursesData();
    const newId = Math.max(...courses.map(c => c.id), 0) + 1;
    courseData.id = newId;
    courses.push(courseData);
    saveCoursesData(courses);
    return courseData;
}

// Update existing course
function updateCourseData(courseId, courseData) {
    const courses = getCoursesData();
    const index = courses.findIndex(c => c.id === courseId);
    if (index !== -1) {
        courses[index] = { ...courses[index], ...courseData };
        saveCoursesData(courses);
        return courses[index];
    }
    return null;
}

// Delete course
function deleteCourseData(courseId) {
    const courses = getCoursesData();
    const filtered = courses.filter(c => c.id !== courseId);
    saveCoursesData(filtered);
    return filtered;
}

// Get single course by ID
function getCourseById(courseId) {
    const courses = getCoursesData();
    return courses.find(c => c.id === courseId);
}
