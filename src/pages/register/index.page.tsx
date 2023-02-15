import { api } from '@/lib/axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Heading, MultiStep, Text, TextInput } from '@ignite-ui/react'
import { AxiosError } from 'axios'
import { useRouter } from 'next/router'
import { ArrowRight } from 'phosphor-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Container, Form, FormError, Header, Space } from './styles'

const registerFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'O nome de usuário deve ter pelo menos 3 caracteres' })
    .regex(/^([a-z\\-]+)$/i, {
      message: 'O nome de usuário só pode ter letras e hifens',
    })
    .transform((username) => username.toLowerCase()),
  name: z
    .string()
    .min(3, { message: 'O nome precisa ter pelo menos 3 caracteres' }),
})

type RegisterFormData = z.infer<typeof registerFormSchema>

export default function Register({ username, name }: RegisterFormData) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    // setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: router.query.username ? String(router.query.username) : '',
    },
  })

  // useEffect(() => {
  //   if (router.query.username) {
  //     setValue('username', String(router.query.username))
  //   }
  // }, [setValue, query?.username])

  async function handleRegister({ username, name }: RegisterFormData) {
    try {
      await api.post('/users', {
        name,
        username,
      })

      await router.push('/register/connect-calendar')
    } catch (error) {
      if (error instanceof AxiosError) {
        return alert(error?.response?.data.message)
      }

      console.log(error)
    }
  }

  return (
    <Container>
      <Header>
        <Heading as="h1">Bem vindo ao Ignite Call!</Heading>
        <Text>
          Precisamos de mais algumas informações para criar seu perfil. Ah, você
          pode editar essas informações depois!
        </Text>

        <MultiStep size={4} />
      </Header>

      <Form as="form" onSubmit={handleSubmit(handleRegister)}>
        <label>
          <Text size="sm">Nome de usuário</Text>
          <TextInput
            prefix="ignite.com/"
            placeholder="seu-usuario"
            {...register('username')}
          />

          {errors.username?.message ? (
            <FormError size="sm">{errors.username?.message}</FormError>
          ) : (
            <Space />
          )}
        </label>

        <label>
          <Text size="sm">Nome completo</Text>
          <TextInput placeholder="Seu Nome Completo" {...register('name')} />

          {errors.username?.message ? (
            <FormError size="sm">{errors.name?.message}</FormError>
          ) : (
            <Space />
          )}
        </label>

        <Button type="submit" disabled={isSubmitting}>
          Próximo passo
          <ArrowRight />
        </Button>
      </Form>
    </Container>
  )
}
