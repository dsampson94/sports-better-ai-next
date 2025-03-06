'use client';

import { motion } from 'framer-motion';
import { FaLinkedin, FaTwitter, FaYoutube } from 'react-icons/fa';

export default function Footer() {
    return (
        <motion.footer
            initial={ { opacity: 0, y: 20 } }
            animate={ { opacity: 1, y: 0 } }
            transition={ { duration: 0.5 } }
            className="flex border-t-2 border-[#545b63] shadow-lg justify-center space-x-4 text-gray-300 py-4"
        >
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
               className={ `hover:text-blue-600` }>
                <FaYoutube size={ 24 }/>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
               className={ `hover:text-blue-600` }>
                <FaTwitter size={ 24 }/>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
               className={ `hover:text-blue-600` }>
                <FaLinkedin size={ 24 }/>
            </a>
        </motion.footer>
    );
}
