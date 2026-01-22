import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function QuizCreator() {
  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    image: null, // New field for image
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleAddQuestion = () => {
    if (
      questionForm.question.trim() &&
      questionForm.options.every(opt => opt.trim() !== '')
    ) {
      setQuestions([...questions, questionForm]);
      setQuestionForm({
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        image: null,
      });
      setImagePreview(null);
    } else {
      alert('Please fill in all question and options.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setQuestionForm({ ...questionForm, image: reader.result });
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  return (
    <div>
         <header className="flex justify-between items-center px-6 md:px-20 py-5 bg-gradient-to-r from-green-100 to-blue-100 shadow">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-blue-800">
          Jack Marvel
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition text-sm"
          >
            Logout
          </button>
        </div>
      </header>
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-pink-50 p-6 pt-20">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold text-center text-pink-700 mb-10"
      >
        Create Quiz Paper
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-lg space-y-4"
        >
          <label className="block">
            <span className="font-medium text-gray-700">Question</span>
            <textarea
              className="w-full mt-1 p-3 border rounded"
              value={questionForm.question}
              onChange={e => setQuestionForm({ ...questionForm, question: e.target.value })}
            ></textarea>
          </label>

          {/* Image Upload */}
          <label className="block">
            <span className="font-medium text-gray-700">Attach Image (optional)</span>
            <input
              type="file"
              accept="image/*"
              className="w-full mt-1"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 h-32 rounded object-contain border"
              />
            )}
          </label>

          {/* Options */}
          {questionForm.options.map((opt, idx) => (
            <label key={idx} className="block">
              <span className="font-medium text-gray-700">Option {idx + 1}</span>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded"
                value={opt}
                onChange={e => {
                  const newOptions = [...questionForm.options];
                  newOptions[idx] = e.target.value;
                  setQuestionForm({ ...questionForm, options: newOptions });
                }}
              />
            </label>
          ))}

          {/* Correct Option */}
          <label className="block">
            <span className="font-medium text-gray-700">Correct Option</span>
            <select
              className="w-full mt-1 p-2 border rounded"
              value={questionForm.correctIndex}
              onChange={e => setQuestionForm({ ...questionForm, correctIndex: parseInt(e.target.value) })}
            >
              {questionForm.options.map((_, idx) => (
                <option key={idx} value={idx}>Option {idx + 1}</option>
              ))}
            </select>
          </label>

          <button
            className="w-full mt-3 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition"
            onClick={handleAddQuestion}
          >
            ➕ Add Question
          </button>

          {questions.length > 0 && (
            <button
              className="w-full mt-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
              onClick={() => setShowPreview(true)}
            >
              📄 Release Question Paper
            </button>
          )}
        </motion.div>

        {/* Right: Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-xl"
        >
          <h3 className="text-xl font-bold text-pink-700 mb-4">📋 Preview</h3>
          {questions.length === 0 ? (
            <p className="text-gray-600 italic">No questions added yet.</p>
          ) : (
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={idx} className="bg-pink-50 p-4 rounded shadow">
                  <p className="font-medium">{idx + 1}. {q.question}</p>
                  {q.image && (
                    <img
                      src={q.image}
                      alt="Question"
                      className="my-2 h-32 object-contain rounded border"
                    />
                  )}
                  <ul className="list-disc pl-6 text-sm mt-2">
                    {q.options.map((opt, oidx) => (
                      <li
                        key={oidx}
                        className={q.correctIndex === oidx ? 'text-green-600 font-bold' : ''}
                      >
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-20 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl font-semibold z-50"
          >
            ✅ Question Paper Released!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </div>
  
  );
}

export default QuizCreator;
