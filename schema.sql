-- СибОйл: схема базы для Supabase. Выполнить целиком в SQL Editor.
create table stations (id serial primary key, num text unique not null, address text not null, district text not null, pos int not null default 0);
create table prices (station_id int references stations on delete cascade, fuel text check (fuel in ('98','95','92','92e','dt')),
  price numeric(6,2) not null check (price > 0), updated_at timestamptz not null default now(), updated_by uuid, primary key (station_id, fuel));
create table queue (station_id int primary key references stations on delete cascade, level smallint not null check (level between 0 and 2),
  updated_at timestamptz not null default now(), updated_by uuid);
create table places (name text primary key, lat double precision not null, lon double precision not null);
create table distances (from_place text references places on delete cascade, to_place text references places on delete cascade,
  km numeric(7,1) not null check (km > 0), primary key (from_place, to_place));
create table staff (user_id uuid primary key references auth.users on delete cascade, role text not null check (role in ('staff','manager')),
  station_id int references stations);

-- Время и автор проставляются сервером, подделать их с клиента нельзя.
create function stamp() returns trigger language plpgsql as $$ begin new.updated_at := now(); new.updated_by := auth.uid(); return new; end $$;
create trigger t_prices before insert or update on prices for each row execute function stamp();
create trigger t_queue before insert or update on queue for each row execute function stamp();

create function is_manager() returns boolean language sql security definer stable set search_path = public
  as $$ select exists (select 1 from staff where user_id = auth.uid() and role = 'manager') $$;
create function my_station() returns int language sql security definer stable set search_path = public
  as $$ select station_id from staff where user_id = auth.uid() $$;

alter table stations enable row level security; alter table prices enable row level security; alter table queue enable row level security;
alter table places enable row level security; alter table distances enable row level security; alter table staff enable row level security;

-- Читать могут все; менять цены, расстояния и станции только менеджер.
create policy r_stations on stations for select using (true);
create policy w_stations on stations for all to authenticated using (is_manager()) with check (is_manager());
create policy r_prices on prices for select using (true);
create policy w_prices on prices for all to authenticated using (is_manager()) with check (is_manager());
create policy r_places on places for select using (true);
create policy w_places on places for all to authenticated using (is_manager()) with check (is_manager());
create policy r_dist on distances for select using (true);
create policy w_dist on distances for all to authenticated using (is_manager()) with check (is_manager());
-- Очередь: сотрудник меняет только свою АЗС, менеджер любую.
create policy r_queue on queue for select using (true);
create policy i_queue on queue for insert to authenticated with check (is_manager() or station_id = my_station());
create policy u_queue on queue for update to authenticated using (is_manager() or station_id = my_station()) with check (is_manager() or station_id = my_station());
create policy r_staff on staff for select to authenticated using (user_id = auth.uid() or is_manager());
create policy w_staff on staff for all to authenticated using (is_manager()) with check (is_manager());

grant select on stations, prices, queue, places, distances to anon, authenticated;
grant select on staff to authenticated;
grant insert, update, delete on stations, prices, queue, places, distances, staff to authenticated;
grant usage on all sequences in schema public to authenticated;

-- Начальные данные (цены с сайта сибоил.рф, сверьте перед запуском).
insert into stations (num,address,district,pos) values
('1','Покровский тракт, 4 км','Якутск',1),
('2','ул. Очиченко, 6','Якутск',2),
('3','ул. Дежнева, 77/2','Якутск',3),
('4','Хатын-Юряхское шоссе, 4','Якутск',4),
('6','Покровский тракт, 7 км','Якутск',5),
('8','ул. 50 лет Советской Армии, 17а','Якутск',6),
('10','мкр. Марха, ул. Авиаторов-Набережная','Якутск',7),
('14','ул. Советской Армии, 53/4а','Якутск',8),
('15','Вилюйский тракт, 6 км, 19','Якутск',9),
('16','ул. Чернышевского, 1-я','Якутск',10),
('17','ул. Петра Алексеева, 72/2а','Якутск',11),
('18','Вилюйский тракт, 3 км, 4/2','Якутск',12),
('22','Сергеляхское шоссе, 4 км, 2/1','Якутск',13),
('5','Покровск, Покровский тракт, 74 км','Хангаласский район',14),
('7','с. Октемцы, Покровский тракт, 49 км','Хангаласский район',15),
('9','с. Майя, ул. Героя Попова','Мегино-Кангаласский район',16),
('11','п. Нижний Бестях, ул. Ленина, 64а','Мегино-Кангаласский район',17),
('12','п. Нижний Бестях, 1 км дороги на Майю','Мегино-Кангаласский район',18),
('19','Вилюйский тракт, 4 км, 6/1','Якутск (Экто-Ойл)',19),
('20','ул. Автодорожная, 7а','Якутск (Экто-Ойл)',20),
('21','ул. Циолковского, 24/1','Якутск (Экто-Ойл)',21),
('23','Окружное шоссе, 4 км, 4/2я','Якутск (Экто-Ойл)',22),
('25','Покровский тракт, 7 км, 1а','Якутск (Экто-Ойл)',23),
('26','г. Вилюйск, ул. Ленина','Вилюйский район',24),
('27','пгт Кысыл-Сыр','Вилюйский район',25),
('29','с. Илбенге','Вилюйский район',26);

insert into prices (station_id,fuel,price) values
((select id from stations where num='1'),'98',128),
((select id from stations where num='1'),'95',103),
((select id from stations where num='1'),'92',98),
((select id from stations where num='1'),'92e',99),
((select id from stations where num='1'),'dt',120),
((select id from stations where num='2'),'98',128),
((select id from stations where num='2'),'95',103),
((select id from stations where num='2'),'92',98),
((select id from stations where num='2'),'92e',99),
((select id from stations where num='2'),'dt',120),
((select id from stations where num='3'),'98',128),
((select id from stations where num='3'),'95',103),
((select id from stations where num='3'),'92',98),
((select id from stations where num='3'),'92e',99),
((select id from stations where num='3'),'dt',120),
((select id from stations where num='4'),'98',128),
((select id from stations where num='4'),'95',103),
((select id from stations where num='4'),'92',98),
((select id from stations where num='4'),'92e',99),
((select id from stations where num='4'),'dt',120),
((select id from stations where num='6'),'98',128),
((select id from stations where num='6'),'95',103),
((select id from stations where num='6'),'92',98),
((select id from stations where num='6'),'92e',99),
((select id from stations where num='6'),'dt',120),
((select id from stations where num='8'),'98',128),
((select id from stations where num='8'),'95',103),
((select id from stations where num='8'),'92',98),
((select id from stations where num='8'),'92e',99),
((select id from stations where num='8'),'dt',120),
((select id from stations where num='10'),'98',128),
((select id from stations where num='10'),'95',103),
((select id from stations where num='10'),'92',98),
((select id from stations where num='10'),'92e',99),
((select id from stations where num='10'),'dt',120),
((select id from stations where num='14'),'95',103),
((select id from stations where num='14'),'92',98),
((select id from stations where num='14'),'dt',120),
((select id from stations where num='15'),'98',128),
((select id from stations where num='15'),'95',103),
((select id from stations where num='15'),'92',98),
((select id from stations where num='15'),'92e',99),
((select id from stations where num='15'),'dt',120),
((select id from stations where num='16'),'98',128),
((select id from stations where num='16'),'95',103),
((select id from stations where num='16'),'92',98),
((select id from stations where num='16'),'92e',99),
((select id from stations where num='16'),'dt',120),
((select id from stations where num='17'),'95',103),
((select id from stations where num='17'),'92',98),
((select id from stations where num='17'),'92e',99),
((select id from stations where num='17'),'dt',120),
((select id from stations where num='18'),'95',103),
((select id from stations where num='18'),'92',98),
((select id from stations where num='18'),'dt',120),
((select id from stations where num='22'),'95',103),
((select id from stations where num='22'),'92',98),
((select id from stations where num='22'),'92e',99),
((select id from stations where num='22'),'dt',120),
((select id from stations where num='5'),'95',103),
((select id from stations where num='5'),'92',98),
((select id from stations where num='5'),'92e',99),
((select id from stations where num='5'),'dt',120),
((select id from stations where num='7'),'95',103),
((select id from stations where num='7'),'92',98),
((select id from stations where num='7'),'92e',99),
((select id from stations where num='7'),'dt',120),
((select id from stations where num='9'),'95',100),
((select id from stations where num='9'),'92',97),
((select id from stations where num='9'),'92e',98),
((select id from stations where num='9'),'dt',120),
((select id from stations where num='11'),'95',100),
((select id from stations where num='11'),'92',97),
((select id from stations where num='11'),'92e',98),
((select id from stations where num='11'),'dt',120),
((select id from stations where num='12'),'98',128),
((select id from stations where num='12'),'95',100),
((select id from stations where num='12'),'92',97),
((select id from stations where num='12'),'92e',98),
((select id from stations where num='12'),'dt',120),
((select id from stations where num='19'),'98',128),
((select id from stations where num='19'),'95',103),
((select id from stations where num='19'),'92',98),
((select id from stations where num='19'),'dt',120),
((select id from stations where num='20'),'98',128),
((select id from stations where num='20'),'95',103),
((select id from stations where num='20'),'92',98),
((select id from stations where num='20'),'92e',99),
((select id from stations where num='20'),'dt',120),
((select id from stations where num='21'),'95',103),
((select id from stations where num='21'),'92',98),
((select id from stations where num='21'),'dt',120),
((select id from stations where num='23'),'98',128),
((select id from stations where num='23'),'95',103),
((select id from stations where num='23'),'92',98),
((select id from stations where num='23'),'92e',99),
((select id from stations where num='23'),'dt',120),
((select id from stations where num='25'),'98',128),
((select id from stations where num='25'),'95',103),
((select id from stations where num='25'),'92',98),
((select id from stations where num='25'),'dt',120),
((select id from stations where num='26'),'95',105),
((select id from stations where num='26'),'92',99),
((select id from stations where num='26'),'92e',100),
((select id from stations where num='26'),'dt',120),
((select id from stations where num='27'),'95',105),
((select id from stations where num='27'),'92',99),
((select id from stations where num='27'),'dt',120),
((select id from stations where num='29'),'95',105),
((select id from stations where num='29'),'92',99),
((select id from stations where num='29'),'dt',120);

insert into places (name,lat,lon) values
('Якутск',62.0355,129.6755),('Покровск',61.4836,129.1481),('Октемцы',61.67,129.33),('Нижний Бестях',61.9547,129.9164),
('Майя',61.7333,130.2833),('Вилюйск',63.7536,121.6244),('Кысыл-Сыр',63.8978,122.7617),('Амга',60.8942,131.9778),
('Нюрба',63.2833,118.3333),('Мирный',62.5353,113.9611),('Олёкминск',60.3737,120.4267),('Ленск',60.7276,114.9548),('Алдан',58.6031,125.3894);
-- Расстояния по дорогам: пока только подтверждённые по адресам АЗС. Остальные добавьте на странице staff.html (раздел менеджера).
insert into distances (from_place,to_place,km) values ('Якутск','Покровск',74),('Якутск','Октемцы',49);
