import React from 'react'
import {
  ActionIcon,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core'
import { IconMoon, IconSun } from '@tabler/icons-react'
import cx from 'clsx'
import classes from './ColorSchemeToggle.module.css'

const ColorSchemeToggle = () => {
  const { setColorScheme } = useMantineColorScheme()

  // -> computedColorScheme is 'light' | 'dark', argument is the default value
  const computedColorScheme = useComputedColorScheme('dark')

  // Correct color scheme toggle implementation
  // computedColorScheme is always either 'light' or 'dark'
  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <ActionIcon
      onClick={toggleColorScheme}
      variant="default"
      size="xl"
      aria-label="Toggle color scheme"
      className={cx(classes.theme_action_button)}
    >
      <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
      <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
    </ActionIcon>
  )
}

export default ColorSchemeToggle
