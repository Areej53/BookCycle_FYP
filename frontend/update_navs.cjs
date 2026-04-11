const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

const filesToUpdate = [
    'BrowseBooksPage.jsx',
    'SellerAddBookPage.jsx',
    'SellerReviewPage.jsx',
    'SellerPublishedPage.jsx',
    'SellerCategoriesPage.jsx',
    'SearchResultsPage.jsx',
    'CategoryResultsPage.jsx',
    'BookDetailsPage.jsx',
    'CartPage.jsx'
];

filesToUpdate.forEach(file => {
    const filePath = path.join(pagesDir, file);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');

    // Add import if not present
    if (!content.includes('useAuth')) {
        content = content.replace("import React", "import React from 'react';\nimport { useAuth } from '../context/AuthContext';\n//");
        // Clean up any double imports of React
        content = content.replace("import React from 'react';\nimport { useAuth } from '../context/AuthContext';\n// from 'react';", "import React from 'react';\nimport { useAuth } from '../context/AuthContext';");
    }

    // Add const { user } = useAuth();
    const funcMatch = content.match(/export default function ([A-Za-z0-9_]+)\(\) {(\s*)return \(/);
    if (funcMatch && !content.includes('const { user } = useAuth();')) {
        content = content.replace(
            funcMatch[0], 
            `export default function ${funcMatch[1]}() {\n    const { user } = useAuth();\n    return (`
        );
    }
    
    // Replace Dashboard links depending on formatting
    const dashboardLink1 = '<li><Link to="/dashboard">Dashboard</Link></li>';
    const authElements = `
    {user ? (
        <>
            <li><span className="nav-user" style={{ color: 'var(--text)', fontWeight: 600 }}>Hi, {user.name}</span></li>
            <li><Link to="/logout" className="nav-cta" style={{ marginLeft: 10 }}>Logout</Link></li>
        </>
    ) : (
        <li><Link to="/login" className="nav-cta">Login</Link></li>
    )}`;
    
    if (content.includes(dashboardLink1)) {
        content = content.replace(dashboardLink1, authElements);
    }
    
    // In CartPage the dashboard link could be slightly different?
    const dashboardLink2 = '<li><Link to="/dashboard" className="nav-cta">Profile</Link></li>';
    if (content.includes(dashboardLink2)) {
         content = content.replace(dashboardLink2, authElements);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
});
