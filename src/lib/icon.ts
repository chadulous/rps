export type IconType = 'hand' | 'item'
export type IconName = 'rock' | 'paper' | 'scissors'

type Icon = `${IconType}-${IconName}`

export default Icon