import React from 'react';
import { motion } from 'framer-motion';

const PageHeader = ({ title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="mb-6"
  >
    <h1 className="text-3xl font-bold text-foreground mb-1">{title}</h1>
    <p className="text-muted-foreground">{description}</p>
  </motion.div>
);

export default PageHeader;