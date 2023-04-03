import { Heading, Text } from '@ignite-ui/react';
import Image from 'next/image';
import previewImg from '../../assets/app-preview.png';
import { ClaimUsernameForm } from './components/ClaimUsernameForm';
import { Hero, HomeContainer, Preview } from './styles';
import { NextSeo } from 'next-seo';

export default function Home() {
	return (
		<>
			<NextSeo
				title='Descomplique sua agenda | Ignite Call'
				description='Conecta o seu calendário e permita que as pessoas marquem agendamentos no seu tempo livre.'
			/>
			<HomeContainer>
				<Hero>
					<Heading as="h1" size="4xl">
						Agendamento descomplicado
					</Heading>
					<Text size="xl">
						Conecta o seu calendário e permita que as pessoas marquem agendamentos no seu tempo livre.
					</Text>

					<ClaimUsernameForm />
				</Hero>

				<Preview>
					<Image src={previewImg} alt="" height={400} quality={100} priority />
				</Preview>
			</HomeContainer>
		</>
	);
}
