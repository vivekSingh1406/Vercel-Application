create table story (
 id varchar(64) primary key, title varchar(140) not null, slug varchar(512) not null,
 excerpt varchar(300) not null, content text not null, author varchar(80) not null,
 image varchar(4096), image_name varchar(255), category varchar(255), created_at datetime(6) not null,
 status varchar(16) not null check(status in ('DRAFT','PUBLISHED')), published_slug varchar(512) unique,
 date_only boolean not null default false, version bigint not null default 0,
 check ((status='DRAFT' and published_slug is null) or (status='PUBLISHED' and published_slug is not null and published_slug=slug))
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_0900_as_cs;
create index story_status_created on story(status,created_at);
create table community_message (id varchar(64) primary key, message varchar(600) not null, author_of_message varchar(80) not null, created_at datetime(6) not null, version bigint not null default 0) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_0900_as_cs;
create index message_created on community_message(created_at);
create table content_lock(id integer primary key) engine=InnoDB;
insert into content_lock(id) values(1);
