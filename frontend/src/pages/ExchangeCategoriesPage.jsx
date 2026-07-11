import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IMAGES } from '../data/assets';
import { useAuth } from '../context/AuthContext';
import RecommendationWidget from '../components/RecommendationWidget';
import Navbar from '../components/Navbar';

export default function ExchangeCategoriesPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleCategoryClick = (cat) => {
        navigate(`/explore?cats=${encodeURIComponent(cat)}&type=exchange`);
    };

    return (
        <div className="SellerCategoriesPage">
            <header className="seller-header">
                <div className="progress-wrap"><div className="progress-steps"><div className="p-step active"><div className="p-num">1</div>Categories</div><div className="p-line "></div><div className="p-step "><div className="p-num">2</div>Book Details</div><div className="p-line "></div><div className="p-step "><div className="p-num">3</div>Review</div><div className="p-line "></div><div className="p-step "><div className="p-num">4</div>Published!</div></div></div>
            </header>

            <div className="page-layout">
                <main>
                    <div className="cat-header">
                        <div className="cat-tag"><span className="cat-tag-dot"></span>BookCycle Exchange Shelf</div>
                        <h1 className="cat-title">Browse Exchange <em>Categories</em></h1>
                        <p className="cat-sub">Choose a category to browse exchange books. Find books you want and trade your own books with others!</p>
                    </div>

                    <div className="cat-grid">
                        {[{id: 'programming', name: 'Programming', desc: 'CS, coding, algorithms, software engineering & tech.', count: 148, img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=150&q=80'},
                            {id: 'science', name: 'Science', desc: 'Physics, chemistry, biology, astronomy & natural sciences.', count: 92, img: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=150&q=80'},
                            {id: 'novels', name: 'Novels', desc: 'Fiction, literary classics, thrillers, romance & contemporary stories.', count: 214, img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=150&q=80'},
                            {id: 'self-dev', name: 'Self-Development', desc: 'Mindset, productivity, habits, motivation & personal growth.', count: 130, img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150&q=80'},
                            {id: 'algebra', name: 'Algebra', desc: 'Linear algebra, abstract algebra, equations, matrices & number theory.', count: 63, img: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=150&q=80'},
                            {id: 'mathematics', name: 'Mathematics', desc: 'Calculus, statistics, geometry, discrete math & applied mathematics.', count: 84, img: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=150&q=80'},
                            {id: 'physics', name: 'Physics', desc: 'Classical mechanics, quantum physics, thermodynamics & electromagnetism.', count: 71, img: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=150&q=80'},
                            {id: 'notes', name: 'Notes', desc: 'Study notes, lecture summaries, past papers & educational materials.', count: 45, img: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=150&q=80'}
                        ].map(cat => (
                            <div key={cat.id} className="cat-card" onClick={() => handleCategoryClick(cat.name)}>
                                <div className="cat-img"><img src={cat.img} alt={cat.name}/></div>
                                <div className="cat-name">{cat.name}</div>
                                <div className="cat-desc">{cat.desc}</div>
                                <div className="cat-count"><span className="cat-count-dot"></span>{cat.count} books</div>
                            </div>
                        ))}
                    </div>
                </main>
                
                <aside className="sidebar">
                    <RecommendationWidget />
                </aside>
            </div>
        </div>
    );
}
