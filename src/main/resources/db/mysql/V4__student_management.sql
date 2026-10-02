alter table exam_user add column username varchar(254), add column active boolean not null default true;
update exam_user set username=lower(email);
alter table exam_user modify username varchar(254) not null, modify email varchar(254) null,
 add constraint uq_exam_user_username unique(username);
alter table exam_attempt add column attempt_number integer, add column student_name varchar(80);
update exam_attempt a join exam_user u on u.id=a.user_id set a.student_name=u.name;
create temporary table attempt_numbers as
 select id, row_number() over (partition by user_id,exam_id order by started_at,id) as number from exam_attempt;
update exam_attempt a join attempt_numbers n on n.id=a.id set a.attempt_number=n.number;
drop temporary table attempt_numbers;
alter table exam_attempt modify attempt_number integer not null, modify student_name varchar(80) not null,
 add constraint uq_exam_attempt_number unique(user_id,exam_id,attempt_number);
