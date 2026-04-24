# FreshCart Grocery

A simple online grocery ordering website built with HTML, CSS, and JavaScript.

## Project Focus

- Primary focus: online grocery ordering website UI
- Secondary focus: simple state management in vanilla JavaScript

## Files

- `index.html` - page structure
- `styles.css` - visual design and responsive layout
- `script.js` - product data, centralized state store, rendering, and cart logic

## State Management Idea

The app uses a lightweight store pattern:

- `createStore(initialState)` keeps a single source of truth
- `setState()` updates filters or cart data
- `subscribe(render)` re-renders the UI whenever state changes

This keeps the code easy to understand for a small web tech project while still showing a real state-management approach.

## Run

Open `index.html` in any modern browser.
