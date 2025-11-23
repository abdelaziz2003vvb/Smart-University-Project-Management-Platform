const xml2js = require('xml2js');

// Build XML from project data
exports.buildProjectXML = (project) => {
  const builder = new xml2js.Builder({
    rootName: 'project',
    xmldec: { version: '1.0', encoding: 'UTF-8' }
  });

  const projectData = {
    id: project._id.toString(),
    title: project.title,
    description: project.description,
    status: project.status,
    student: {
      id: project.studentId._id.toString(),
      name: project.studentId.name,
      email: project.studentId.email
    },
    teacher: project.teacherId ? {
      id: project.teacherId._id.toString(),
      name: project.teacherId.name,
      email: project.teacherId.email
    } : {},
    tasks: {
      task: project.tasks.map(task => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description || '',
        deadline: task.deadline ? task.deadline.toISOString() : '',
        progress: task.progress,
        status: task.status
      }))
    },
    grade: project.grade || '',
    feedback: project.feedback || '',
    submittedAt: project.submittedAt ? project.submittedAt.toISOString() : '',
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString()
  };

  return builder.buildObject(projectData);
};

// Parse XML to project data
exports.parseProjectXML = async (xmlString) => {
  const parser = new xml2js.Parser();
  
  try {
    const result = await parser.parseStringPromise(xmlString);
    const projectXML = result.project;

    const projectData = {
      title: projectXML.title[0],
      description: projectXML.description[0],
      status: projectXML.status ? projectXML.status[0] : 'draft',
      tasks: []
    };

    // Parse tasks if present
    if (projectXML.tasks && projectXML.tasks[0] && projectXML.tasks[0].task) {
      projectData.tasks = projectXML.tasks[0].task.map(task => ({
        title: task.title[0],
        description: task.description ? task.description[0] : '',
        deadline: task.deadline ? new Date(task.deadline[0]) : null,
        progress: task.progress ? parseInt(task.progress[0]) : 0,
        status: task.status ? task.status[0] : 'pending'
      }));
    }

    return projectData;
  } catch (error) {
    throw new Error(`Failed to parse XML: ${error.message}`);
  }
};