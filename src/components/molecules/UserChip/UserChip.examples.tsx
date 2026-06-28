import heroImage from '../../../assets/hero.png'
import { Avatar } from '../../atoms/Avatar'
import { UserChip } from './UserChip'

export function UserChipExamples() {
  return (
    <>
      <UserChip name="Maria Santos" role="Estudante · TADS" color="blue" />
      <UserChip
        name="Prof. João Lima"
        role="Orientador · Banco de Dados"
        color="teal"
      />
      <UserChip name="Ana Beatriz" role="Bolsista" color="purple" size="sm" />
      <UserChip
        name="Larissa Almeida"
        role="Pesquisadora · IA"
        color="pink"
        size="lg"
        src={heroImage}
      />
    </>
  )
}

export function AvatarExamples() {
  return (
    <>
      <Avatar name="Maria Santos" color="blue" />
      <Avatar name="João Lima" color="teal" />
      <Avatar name="Paula Alves" color="purple" />
      <Avatar name="Ana Clara" color="amber" />
      <Avatar name="Rafaela Silva" color="pink" />
      <Avatar name="Maria Santos" size="sm" />
      <Avatar name="Maria Santos" size="md" />
      <Avatar name="Maria Santos" size="lg" />
    </>
  )
}
