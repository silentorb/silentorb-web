---
title: Marloth 0.1 Manual
template: marloth
---
# Marloth 0.1 Manual

## Overview

* [Marloth](./game-0.1.md) is a Roguelike Survival Horror game
* Players explore a hostile world, gathering food and fighting monsters
* This is an alpha version

* There is currently no end-game
* Each playthrough lasts until the player dies or resigns

## The Player

* At the start of a new game, the player can choose a profession

* Each profession has a different weapon and varying stats

## Resources

### Health

* When a player's health reaches zero the player dies
* Player health slowly drains over time
* Players can gather food that is scattered throughout the world
* Players can eat food by pressing the Use Item button ($$use-item)
* Eating food restores health

### Energy

* When a player's energy reaches zero the player dies
* Player energy slowly drains over time
* Moving and other actions drain energy
* A player's energy cannot be greater than the player's health

### Sleep

* Players can sleep in a bed
* Sleeping restores energy to the amount of health the player has
* Sleeping drains some health
* The more energy is regained, the more health is drained
* After sleeping, the player awakes to a new world outside the house
* The new world will contain fresh food to gather
* The new world will contain most of the same monsters as the previous world, restored to life if they were dead
* The quantity of monsters increases slightly with each new world

## Combat

* The world is populated with monsters that will attack you on sight
* Monsters have health and energy like players do, and can die when either resource is depleted
* Players can attack enemies but it drains much energy

### Shadow Spirit

* The Alchemist and Magician have the Shadow Spirit ability which can be activated with the Mobility button ($$ability-mobility)
* Shadow Spirit allows the player to explore the world as a non-corporeal being
* Shadow Spirit costs a little energy to activate
* While in Shadow Spirit mode, the drain of energy over time and the energy cost of movement are both increased
