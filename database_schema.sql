--
-- PostgreSQL database dump
--

\restrict GCzE2X6fEIpZI3WxwcpZriueRmQsKDGQgYTteSggnAKt23neuKlCcbkJBCTiaX6

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-11-01 16:51:04

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 234 (class 1255 OID 16530)
-- Name: calculate_total_marks(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_total_marks() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    new.total_marks := new.internal_marks
                     + new.external_marks;
    return new;
end;
$$;


--
-- TOC entry 233 (class 1255 OID 16529)
-- Name: get_student_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_student_count() RETURNS bigint
    LANGUAGE plpgsql
    AS $$
begin
    return (select count(*) from students);
end;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 232 (class 1259 OID 24580)
-- Name: app_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_users (
    user_id bigint NOT NULL,
    username character varying(100) NOT NULL,
    password_hash text NOT NULL,
    role character varying(20) NOT NULL,
    student_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT app_users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'student'::character varying])::text[]))),
    CONSTRAINT chk_app_users_role CHECK (((((role)::text = 'admin'::text) AND (student_id IS NULL)) OR (((role)::text = 'student'::text) AND (student_id IS NOT NULL))))
);


--
-- TOC entry 231 (class 1259 OID 24579)
-- Name: app_users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.app_users ALTER COLUMN user_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.app_users_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 225 (class 1259 OID 16449)
-- Name: attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance (
    attendance_id bigint NOT NULL,
    enrollment_id bigint NOT NULL,
    attendance_date date NOT NULL,
    status character varying(10) NOT NULL,
    CONSTRAINT attendance_status_check CHECK (((status)::text = ANY ((ARRAY['Present'::character varying, 'Absent'::character varying, 'Late'::character varying])::text[])))
);


--
-- TOC entry 224 (class 1259 OID 16448)
-- Name: attendance_attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.attendance ALTER COLUMN attendance_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.attendance_attendance_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 228 (class 1259 OID 16487)
-- Name: course_prerequisites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_prerequisites (
    course_id character varying(20) NOT NULL,
    prerequisite_course_id character varying(20) NOT NULL,
    CONSTRAINT course_prerequisites_check CHECK (((course_id)::text <> (prerequisite_course_id)::text))
);


--
-- TOC entry 221 (class 1259 OID 16412)
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    course_id character varying(20) NOT NULL,
    course_name character varying(150) NOT NULL,
    credits integer NOT NULL,
    department character varying(100) NOT NULL,
    CONSTRAINT courses_credits_check CHECK ((credits > 0))
);


--
-- TOC entry 223 (class 1259 OID 16423)
-- Name: enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enrollments (
    enrollment_id bigint NOT NULL,
    student_id character varying(20) NOT NULL,
    course_id character varying(20) NOT NULL,
    enrollment_date date DEFAULT CURRENT_DATE NOT NULL,
    status character varying(20) DEFAULT 'Enrolled'::character varying NOT NULL,
    CONSTRAINT enrollments_status_check CHECK (((status)::text = ANY ((ARRAY['Enrolled'::character varying, 'Completed'::character varying, 'Dropped'::character varying])::text[])))
);


--
-- TOC entry 222 (class 1259 OID 16422)
-- Name: enrollments_enrollment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.enrollments ALTER COLUMN enrollment_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.enrollments_enrollment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 220 (class 1259 OID 16401)
-- Name: faculty; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faculty (
    faculty_id character varying(20) NOT NULL,
    faculty_name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    department character varying(100) NOT NULL
);


--
-- TOC entry 229 (class 1259 OID 16505)
-- Name: faculty_courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faculty_courses (
    faculty_id character varying(20) NOT NULL,
    course_id character varying(20) NOT NULL
);


--
-- TOC entry 227 (class 1259 OID 16467)
-- Name: marks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marks (
    mark_id bigint NOT NULL,
    enrollment_id bigint NOT NULL,
    internal_marks numeric(7,2) NOT NULL,
    external_marks numeric(7,2) NOT NULL,
    total_marks numeric(7,2) NOT NULL,
    grade character varying(5),
    CONSTRAINT marks_check CHECK ((total_marks = (internal_marks + external_marks))),
    CONSTRAINT marks_external_marks_check CHECK ((external_marks >= (0)::numeric)),
    CONSTRAINT marks_internal_marks_check CHECK ((internal_marks >= (0)::numeric))
);


--
-- TOC entry 226 (class 1259 OID 16466)
-- Name: marks_mark_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.marks ALTER COLUMN mark_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.marks_mark_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 219 (class 1259 OID 16388)
-- Name: students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.students (
    student_id character varying(20) NOT NULL,
    student_name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    department character varying(100) NOT NULL,
    semester integer NOT NULL,
    CONSTRAINT students_semester_check CHECK ((semester > 0))
);


--
-- TOC entry 230 (class 1259 OID 16525)
-- Name: student_enrollment_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.student_enrollment_view AS
 SELECT students.student_name,
    enrollments.status
   FROM (public.students
     JOIN public.enrollments ON (((students.student_id)::text = (enrollments.student_id)::text)));


--
-- TOC entry 4941 (class 2606 OID 24593)
-- Name: app_users app_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT app_users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4943 (class 2606 OID 24597)
-- Name: app_users app_users_student_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT app_users_student_id_key UNIQUE (student_id);


--
-- TOC entry 4945 (class 2606 OID 24595)
-- Name: app_users app_users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT app_users_username_key UNIQUE (username);


--
-- TOC entry 4928 (class 2606 OID 16460)
-- Name: attendance attendance_enrollment_id_attendance_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_enrollment_id_attendance_date_key UNIQUE (enrollment_id, attendance_date);


--
-- TOC entry 4930 (class 2606 OID 16458)
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (attendance_id);


--
-- TOC entry 4937 (class 2606 OID 16494)
-- Name: course_prerequisites course_prerequisites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_prerequisites
    ADD CONSTRAINT course_prerequisites_pkey PRIMARY KEY (course_id, prerequisite_course_id);


--
-- TOC entry 4919 (class 2606 OID 16421)
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (course_id);


--
-- TOC entry 4921 (class 2606 OID 16435)
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (enrollment_id);


--
-- TOC entry 4923 (class 2606 OID 16437)
-- Name: enrollments enrollments_student_id_course_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_student_id_course_id_key UNIQUE (student_id, course_id);


--
-- TOC entry 4939 (class 2606 OID 16511)
-- Name: faculty_courses faculty_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty_courses
    ADD CONSTRAINT faculty_courses_pkey PRIMARY KEY (faculty_id, course_id);


--
-- TOC entry 4915 (class 2606 OID 16411)
-- Name: faculty faculty_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty
    ADD CONSTRAINT faculty_email_key UNIQUE (email);


--
-- TOC entry 4917 (class 2606 OID 16409)
-- Name: faculty faculty_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty
    ADD CONSTRAINT faculty_pkey PRIMARY KEY (faculty_id);


--
-- TOC entry 4933 (class 2606 OID 16481)
-- Name: marks marks_enrollment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marks
    ADD CONSTRAINT marks_enrollment_id_key UNIQUE (enrollment_id);


--
-- TOC entry 4935 (class 2606 OID 16479)
-- Name: marks marks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marks
    ADD CONSTRAINT marks_pkey PRIMARY KEY (mark_id);


--
-- TOC entry 4911 (class 2606 OID 16400)
-- Name: students students_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_email_key UNIQUE (email);


--
-- TOC entry 4913 (class 2606 OID 16398)
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (student_id);


--
-- TOC entry 4931 (class 1259 OID 16524)
-- Name: idx_attendance_enrollment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attendance_enrollment ON public.attendance USING btree (enrollment_id);


--
-- TOC entry 4924 (class 1259 OID 16523)
-- Name: idx_enrollments_course; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_enrollments_course ON public.enrollments USING btree (course_id);


--
-- TOC entry 4925 (class 1259 OID 16522)
-- Name: idx_enrollments_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_enrollments_student ON public.enrollments USING btree (student_id);


--
-- TOC entry 4926 (class 1259 OID 16532)
-- Name: idx_enrollments_student_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_enrollments_student_id ON public.enrollments USING btree (student_id);


--
-- TOC entry 4955 (class 2620 OID 16531)
-- Name: marks trg_calculate_total_marks; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_total_marks BEFORE INSERT OR UPDATE OF internal_marks, external_marks ON public.marks FOR EACH ROW EXECUTE FUNCTION public.calculate_total_marks();


--
-- TOC entry 4948 (class 2606 OID 16461)
-- Name: attendance attendance_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(enrollment_id);


--
-- TOC entry 4950 (class 2606 OID 16495)
-- Name: course_prerequisites course_prerequisites_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_prerequisites
    ADD CONSTRAINT course_prerequisites_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(course_id);


--
-- TOC entry 4951 (class 2606 OID 16500)
-- Name: course_prerequisites course_prerequisites_prerequisite_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_prerequisites
    ADD CONSTRAINT course_prerequisites_prerequisite_course_id_fkey FOREIGN KEY (prerequisite_course_id) REFERENCES public.courses(course_id);


--
-- TOC entry 4946 (class 2606 OID 16443)
-- Name: enrollments enrollments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(course_id);


--
-- TOC entry 4947 (class 2606 OID 16438)
-- Name: enrollments enrollments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id);


--
-- TOC entry 4952 (class 2606 OID 16517)
-- Name: faculty_courses faculty_courses_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty_courses
    ADD CONSTRAINT faculty_courses_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(course_id);


--
-- TOC entry 4953 (class 2606 OID 16512)
-- Name: faculty_courses faculty_courses_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty_courses
    ADD CONSTRAINT faculty_courses_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculty(faculty_id);


--
-- TOC entry 4954 (class 2606 OID 24598)
-- Name: app_users fk_app_users_student; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT fk_app_users_student FOREIGN KEY (student_id) REFERENCES public.students(student_id);


--
-- TOC entry 4949 (class 2606 OID 16482)
-- Name: marks marks_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marks
    ADD CONSTRAINT marks_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(enrollment_id);


-- Completed on 2026-11-01 16:51:05

--
-- PostgreSQL database dump complete
--

\unrestrict GCzE2X6fEIpZI3WxwcpZriueRmQsKDGQgYTteSggnAKt23neuKlCcbkJBCTiaX6

