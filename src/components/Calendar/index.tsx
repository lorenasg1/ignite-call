import { api } from '../../lib/axios';
import { getWeekDays } from '../../utils/get-week-days';
import { CalendarActions, CalendarBody, CalendarContainer, CalendarDay, CalendarHeader, CalendarTitle } from './styles';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { CaretLeft, CaretRight } from 'phosphor-react';
import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';

type Day = {
	date: dayjs.Dayjs;
	disabled: boolean;
};

type CalendarWeek = {
	week: number;
	days: Array<{
		date: dayjs.Dayjs;
		disabled: boolean;
	}>;
};

type CalendarWeeks = CalendarWeek[];

type BlockedDates = {
	blockedWeekDays: number[];
	blockedDates: number[];
};

type CalendarProps = {
	selectedDate: Date | null;
	onDateSelected: (data: Date) => void;
};

export function Calendar({ selectedDate, onDateSelected }: CalendarProps) {
	const [currentDate, setCurrentDate] = useState(() => {
		return dayjs().set('date', 1);
	});

	const router = useRouter();

	function handlePreviousMonth() {
		setCurrentDate(currentDate.subtract(1, 'month'));
	}

	function handleNextMonth() {
		setCurrentDate(currentDate.add(1, 'month'));
	}

	const shortWeekDays = getWeekDays({ short: true });

	const currentMonth = currentDate.format('MMMM');
	const currentYear = currentDate.format('YYYY');

	const username = String(router.query.username);

	const { data: blockedDates } = useQuery<BlockedDates>(
		['blocked-dates', currentDate.get('year'), currentDate.get('month')],
		async () => {
			const response = await api.get(`/users/${username}/blocked-dates`, {
				params: {
					year: currentDate.get('year'),
					month: currentDate.get('month') + 1,
				},
			});

			return response.data;
		},
	);

	const calendarWeeks = useMemo(() => {
		if (!blockedDates) {
			return [];
		}

		const daysInMonth = Array.from({ length: currentDate.daysInMonth() }).map((_, index) => {
			return currentDate.set('date', index + 1);
		});

		const firstWeekDay = currentDate.get('day');

		const previousMonthFillArray = Array.from({
			length: firstWeekDay,
		})
			.map((_, index) => {
				return currentDate.subtract(index + 1, 'day');
			})
			.reverse();

		const lastDayOfTheMonth = currentDate.endOf('month');
		const lastWeekDay = lastDayOfTheMonth.get('day');

		const nextMonthFillArray = Array.from({
			length: 7 - (lastWeekDay + 1),
		}).map((_, index) => {
			return lastDayOfTheMonth.add(index + 1, 'day');
		});

		const calendarDays = [
			...previousMonthFillArray.map((date) => {
				return { date, disabled: true };
			}),
			...daysInMonth.map((date) => {
				return {
					date,
					disabled:
						date.endOf('day').isBefore(new Date()) ||
						blockedDates.blockedWeekDays.includes(date.get('day')) ||
						blockedDates.blockedDates.includes(date.get('date')),
				};
			}),
			...nextMonthFillArray.map((date) => {
				return { date, disabled: true };
			}),
		];

		const calendarWeeks = calendarDays.reduce<CalendarWeeks>((weeks, _, i, original) => {
			const isNewWeek = i % 7 === 0;

			if (isNewWeek) {
				weeks.push({
					week: i / 7 + 1,
					days: original.slice(i, i + 7),
				});
			}

			return weeks;
		}, []);

		return calendarWeeks;
	}, [currentDate, blockedDates]);

	return (
		<CalendarContainer>
			<CalendarHeader>
				<CalendarTitle>
					{currentMonth} <span>{currentYear}</span>
				</CalendarTitle>
				<CalendarActions>
					<button onClick={handlePreviousMonth} title="mês anterior">
						<CaretLeft />
					</button>
					<button onClick={handleNextMonth} title="próximo mês">
						<CaretRight />
					</button>
				</CalendarActions>
			</CalendarHeader>

			<CalendarBody>
				<thead>
					<tr>
						{shortWeekDays.map((weekDay) => (
							<th key={weekDay}>{weekDay}.</th>
						))}
					</tr>
				</thead>
				<tbody>
					{calendarWeeks.map(({ week, days }) => {
						return (
							<tr key={week}>
								{days.map(({ date, disabled }) => {
									return (
										<td key={date.toString()}>
											<CalendarDay disabled={disabled} onClick={() => onDateSelected(date.toDate())}>
												{date.get('date')}
											</CalendarDay>
										</td>
									);
								})}
							</tr>
						);
					})}
				</tbody>
			</CalendarBody>
		</CalendarContainer>
	);
}
