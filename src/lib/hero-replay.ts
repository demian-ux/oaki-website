/**
 * The one channel between the header logotipo and the home hero.
 *
 * Lives in its own module on purpose: the header renders on every route, and
 * importing the constant straight from HeroShelf would drag that whole client
 * component (covers, drift loop, typewriter) into the header's bundle.
 */
export const HERO_REPLAY_EVENT = "oaki:hero-replay";
