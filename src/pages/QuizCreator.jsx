import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FormInput from '../components/forms/common/FormInput';
import FormTextarea from '../components/forms/common/FormTextarea';

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
  const [formErrors, setFormErrors] = useState({});

  const handleAddQuestion = () => {
    const nextErrors = {};
    if (!questionForm.question.trim()) nextErrors.question = 'Question is required.';
    questionForm.options.forEach((opt, idx) => {
      if (!opt.trim()) nextErrors[`option${idx}`] = `Option ${idx + 1} is required.`;
    });
    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }
    setFormErrors({});
    if (questionForm.question.trim() && questionForm.options.every((opt) => opt.trim() !== '')) {
      setQuestions((prev) => [...prev, questionForm]);
      setQuestionForm({
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        image: null,
      });
      setImagePreview(null);
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
  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-pink-50 p-6 pt-8">
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
          <div>
            <span className="font-medium text-gray-700">Question</span>
            <div className="mt-1">
              <FormTextarea
                rows={3}
                value={questionForm.question}
                onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                error={formErrors.question}
              />
            </div>
          </div>

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
            <div key={idx}>
              <span className="font-medium text-gray-700">Option {idx + 1}</span>
              <div className="mt-1">
                <FormInput
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const newOptions = [...questionForm.options];
                    newOptions[idx] = e.target.value;
                    setQuestionForm({ ...questionForm, options: newOptions });
                  }}
                  error={formErrors[`option${idx}`]}
                />
              </div>
            </div>
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

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-3 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition"
            onClick={handleAddQuestion}
          >
            Add Question
          </motion.button>

          {questions.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
              onClick={() => setShowPreview(true)}
            >
              Release Question Paper
            </motion.button>
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
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                  className="bg-pink-50 p-4 rounded shadow"
                >
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
                </motion.div>
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
