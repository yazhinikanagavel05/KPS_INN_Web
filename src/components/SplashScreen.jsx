import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import logo from '../assets/logo/kps-inn-logo.png';
import hotelBackdrop from '../assets/gallery/hero-luxury.png';
import './splash-screen.css';

const letters = 'KPS INN'.split('');
const particles = Array.from({ length: 20 }, (_, index) => index);
const letterVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: .65, ease: [0.22, 1, 0.36, 1] } } };

export default function SplashScreen({ onComplete }) {
  const [visible, setVisible] = useState(true);
  const [doorsOpen, setDoorsOpen] = useState(false);

  useEffect(() => {
    const openDoorsTimer = setTimeout(() => setDoorsOpen(true), 700);
    const closeSplashTimer = setTimeout(() => setVisible(false), 3500);

    return () => {
      clearTimeout(openDoorsTimer);
      clearTimeout(closeSplashTimer);
    };
  }, []);

  return <AnimatePresence onExitComplete={onComplete}>{visible && <motion.section className="splash-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, filter: 'blur(5px)' }} transition={{ duration: .75, ease: [0.76, 0, 0.24, 1] }} aria-label="Welcome to KPS INN">
    <motion.div className="splash-background" style={{ backgroundImage: `url(${hotelBackdrop})` }} initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1.02, opacity: 1 }} transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}/>
    <div className="splash-overlay"/><div className="splash-rays"/>
    {particles.map(index => <span className={`splash-particle particle-${index % 5}`} key={index} style={{ left: `${5 + (index * 19) % 91}%`, top: `${12 + (index * 31) % 75}%`, animationDelay: `${(index % 7) * -.65}s`, animationDuration: `${7 + index % 5}s` }}/>) }
    <motion.div className="splash-content" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: .1, delayChildren: .55 } } }}>
      <motion.p className="splash-welcome" variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: .8 } } }}>Welcome to</motion.p>
      <motion.div className="splash-logo-wrap" variants={{ hidden: { opacity: 0, scale: .78, filter: 'blur(10px)' }, show: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 1.15, ease: [0.22, 1, 0.36, 1] } } }}><img src={logo} alt="KPS INN"/><span/><i/></motion.div>
      <motion.h1 variants={{ hidden: {}, show: { transition: { staggerChildren: .1, delayChildren: .08 } } }}>{letters.map((letter, index) => <motion.span key={`${letter}-${index}`} variants={letterVariants}>{letter === ' ' ? '\u00a0' : letter}</motion.span>)}</motion.h1>
      <motion.p className="splash-tagline" variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: .9, delay: .25 } } }}>Comfortable rooms and friendly service</motion.p>
      <motion.div className="splash-loading" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: .7, delay: .65 } } }}><span>Your stay begins here</span><i>•••</i></motion.div>
    </motion.div>
    <motion.div className="splash-door splash-door-left" initial={{ x: '0%' }} animate={{ x: doorsOpen ? '-104%' : '0%' }} transition={{ duration: .75, ease: [0.76, 0, 0.24, 1] }}><span/></motion.div>
    <motion.div className="splash-door splash-door-right" initial={{ x: '0%' }} animate={{ x: doorsOpen ? '104%' : '0%' }} transition={{ duration: .75, ease: [0.76, 0, 0.24, 1] }}><span/></motion.div>
    <motion.div className="splash-gold-line" initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ delay: 1.35, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}/>
  </motion.section>}</AnimatePresence>;
}
