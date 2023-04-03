import { Calendar } from '../../../../../components/Calendar';
import { api } from '../../../../../lib/axios';
import { Container, TimePicker, TimePickerHeader, TimePickerItem, TimePickerList } from './styles';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';

type Availability = {
	possibleTimes: number[];
	availableTimes: number[];
};

type CalendarStepProps = {
	onSelectDateTime: (date: Date | null) => void;
};

export function CalendarStep({ onSelectDateTime }: CalendarStepProps) {
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);

	const router = useRouter();

	const isDateSelected = !!selectedDate;
	const username = String(router.query.username);

	const weekDay = selectedDate
		? Intl.DateTimeFormat('pt-BR', {
				weekday: 'long',
		  }).format(selectedDate)
		: null;

	const dayAndMonth = selectedDate
		? Intl.DateTimeFormat('pt-BR', {
				day: 'numeric',
				month: 'long',
		  }).format(selectedDate)
		: null;

	const selectedDateWithoutTime = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null;

	const { data: availability } = useQuery<Availability>(
		['availability', selectedDateWithoutTime],
		async () => {
			const response = await api.get(`/users/${username}/availability`, {
				params: {
					date: selectedDateWithoutTime,
				},
			});

			return response.data;
		},
		{
			enabled: !!selectedDate,
		},
	);

	function handleSelectedTime(time: number) {
		const describedTime = dayjs(selectedDate).set('hour', time).startOf('hour');

		onSelectDateTime(describedTime.toDate());
	}

	return (
		<Container isTimePickerOpen={isDateSelected}>
			<Calendar selectedDate={selectedDate} onDateSelected={setSelectedDate} />

			{isDateSelected && (
				<TimePicker>
					<TimePickerHeader>
						{weekDay}, <span>{dayAndMonth}</span>
					</TimePickerHeader>

					<TimePickerList>
						{availability?.possibleTimes?.map((time) => (
							<TimePickerItem
								key={time}
								onClick={() => handleSelectedTime(time)}
								disabled={!availability.availableTimes.includes(time)}
							>
								{String(time).padStart(2, '0')}h
							</TimePickerItem>
						))}
					</TimePickerList>
				</TimePicker>
			)}
		</Container>
	);
}
