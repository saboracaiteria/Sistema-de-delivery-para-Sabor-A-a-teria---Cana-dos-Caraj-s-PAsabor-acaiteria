const fs = require('fs');
const lines = fs.readFileSync('App.tsx', 'utf-8').split('\n');

const startIdx = lines.findIndex(l => l.trim().startsWith('const Sidebar = () => {'));
const endIdx = lines.findIndex(l => l.trim().startsWith('const Header = () => {'));

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find Sidebar boundaries', startIdx, endIdx);
  process.exit(1);
}

const componentLines = lines.slice(startIdx, endIdx);

const imports = `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Menu, Lock as LockIcon, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useApp } from '../contexts/AppContext';
import { SUPER_ADMIN_PASSWORD } from '../constants';

`;

fs.mkdirSync('components', { recursive: true });
fs.writeFileSync('components/Sidebar.tsx', imports + componentLines.join('\n'));

const newAppLines = [
  ...lines.slice(0, startIdx),
  "import { Sidebar } from './components/Sidebar';",
  ...lines.slice(endIdx) // keeping Header
];

fs.writeFileSync('App.tsx', newAppLines.join('\n'));
console.log('Sidebar extracted successfully!');
