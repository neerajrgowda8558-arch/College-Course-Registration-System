
MERGE (c101:Course {course_id: 'C101'})
SET c101.course_name = 'Programming Fundamentals';

MERGE (c102:Course {course_id: 'C102'})
SET c102.course_name = 'Data Structures';

MERGE (c103:Course {course_id: 'C103'})
SET c103.course_name = 'Database Management Systems';

MERGE (c104:Course {course_id: 'C104'})
SET c104.course_name = 'Operating Systems';

MERGE (c105:Course {course_id: 'C105'})
SET c105.course_name = 'Computer Networks';

MERGE (c102)-[:HAS_PREREQUISITE]->(c101);
MERGE (c103)-[:HAS_PREREQUISITE]->(c101);
MERGE (c103)-[:HAS_PREREQUISITE]->(c102);
MERGE (c104)-[:HAS_PREREQUISITE]->(c102);
MERGE (c105)-[:HAS_PREREQUISITE]->(c101);
