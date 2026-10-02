create table exam_user (
 id varchar(36) primary key,
 name varchar(80) not null,
 email varchar(254) not null unique,
 password_hash varchar(100) not null,
 created_at datetime(6) not null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_0900_as_cs;

create table exam_attempt (
 id varchar(36) primary key,
 user_id varchar(36) not null,
 exam_id varchar(80) not null,
 title varchar(200) not null,
 status varchar(16) not null check (status in ('ACTIVE','SUBMITTED')),
 started_at datetime(6) not null,
 submitted_at datetime(6),
 current_question integer not null default 0,
 snapshot longtext not null,
 result_json text,
 constraint fk_exam_attempt_user foreign key (user_id) references exam_user(id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_0900_as_cs;
create index exam_attempt_user_date on exam_attempt(user_id, started_at);
create index exam_attempt_active on exam_attempt(user_id, exam_id, status);

create table exam_answer (
 attempt_id varchar(36) not null,
 question_id integer not null,
 selected_answer varchar(500) not null,
 primary key (attempt_id, question_id),
 constraint fk_exam_answer_attempt foreign key (attempt_id) references exam_attempt(id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_0900_as_cs;
