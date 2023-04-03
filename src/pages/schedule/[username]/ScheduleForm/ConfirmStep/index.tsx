import { ConfirmForm, FormActions, FormError, FormHeader } from './styles';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Text, TextArea, TextInput } from '@ignite-ui/react';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { CalendarBlank, Clock } from 'phosphor-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { api } from '../../../../../lib/axios';

const confirmFormSchema = z.object({
	name: z.string().min(3, { message: 'O nome precisa de no mínimo 3 caracteres' }),
	email: z.string().email({ message: 'Digite um email válido' }),
	observations: z.string().nullable(),
});

type ConfirmFormData = z.infer<typeof confirmFormSchema>;

type ConfirmStepProps = {
	schedulingDate: Date;
	onCancelConfirmation: () => void;
};

export function ConfirmStep({ schedulingDate, onCancelConfirmation }: ConfirmStepProps) {
	const {
		register,
		handleSubmit,
		formState: { isSubmitting, errors },
	} = useForm<ConfirmFormData>({
		resolver: zodResolver(confirmFormSchema),
	});

	const router = useRouter();
	const username = String(router.query.username);

	async function handleConfirmScheduling({ name, email, observations }: ConfirmFormData) {
		await api.post(`/users/${username}/schedule`, {
			name,
			email,
			observations,
			date: schedulingDate,
		});

		onCancelConfirmation();
	}

	const describedDate = Intl.DateTimeFormat('pt-BR', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
	}).format(schedulingDate);

	const describedTime = `${Intl.DateTimeFormat('pt-BR', {
		timeStyle: 'short',
	}).format(schedulingDate)}h`;

	return (
		<ConfirmForm as="form" onSubmit={handleSubmit(handleConfirmScheduling)}>
			<FormHeader>
				<Text>
					<CalendarBlank />
					{describedDate}
				</Text>
				<Text>
					<Clock />
					{describedTime}
				</Text>
			</FormHeader>

			<label>
				<Text size="sm">Nome completo</Text>
				<TextInput placeholder="Seu nome" {...register('name')} />
				{errors.name && <FormError size="sm">{errors.name.message}</FormError>}
			</label>

			<label>
				<Text size="sm">Endereço de email</Text>
				<TextInput type="email" placeholder="johndoe@example.com" {...register('email')} />
				{errors.email && <FormError size="sm">{errors.email.message}</FormError>}
			</label>

			<label>
				<Text size="sm">Observações</Text>
				<TextArea {...register('observations')} />
				{errors.observations && <FormError size="sm">{errors.observations.message}</FormError>}
			</label>

			<FormActions>
				<Button type="button" variant="tertiary" disabled={isSubmitting} onClick={onCancelConfirmation}>
					Cancelar
				</Button>
				<Button type="submit">Confirmar</Button>
			</FormActions>
		</ConfirmForm>
	);
}
