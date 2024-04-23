import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

function App() {
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [article, setArticle] = useState('');
  const [savedArticles, setSavedArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [containsForbiddenWords, setContainsForbiddenWords] = useState(false);

  const categories = [
    'Главные',
    'Инциденты',
    'Культура',
    'Интересное',
    'Мировые',
    'Экономика',
    'Спорт',
  ];

  useEffect(() => {
    const savedArticlesFromStorage = localStorage.getItem('savedArticles');
    if (savedArticlesFromStorage) {
      setSavedArticles(JSON.parse(savedArticlesFromStorage));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
  }, [savedArticles]);

  useEffect(() => {
    const counts = {};
    categories.forEach((category) => {
      counts[category] = savedArticles.filter(
        (article) => article.category === category
      ).length;
    });
    setCategoryCounts(counts);
  }, [savedArticles]);

  useEffect(() => {
    const forbiddenWordsRegex = /Укринформ|Читайте также:/;
    const isForbiddenWordExist = forbiddenWordsRegex.test(article);
    setContainsForbiddenWords(isForbiddenWordExist);
  }, [article]);

  const handleFormatAndSave = () => {
    if (!selectedCategory) {
      alert('Выберите категорию для сохранения статьи!');
      return;
    }

    if (containsForbiddenWords) {
      alert('Статья содержит запрещенные слова: "Укринформ" или "Читайте также:"');
      return;
    }

    const lines = article.split('\n');

    const formattedArticle = lines
      .map((line, index) => (index === 0 ? line : line.replace(/^\s*/, '   ')))
      .join('\n');

    const formatted = ` -PAGE-\n${title}\n${city} (Unian) - ${formattedArticle}\n -END-`;

    const filteredFormatted = formatted
      .split('\n')
      .filter((line) => line.trim() !== '')
      .join('\n');

    const newArticle = {
      category: selectedCategory,
      title: title,
      content: filteredFormatted + '\n\n',
    };

    if (editIndex !== null) {
      const updatedArticles = [...savedArticles];
      updatedArticles[editIndex] = newArticle;
      setSavedArticles(updatedArticles);
    } else {
      setSavedArticles([...savedArticles, newArticle]);
    }

    // navigator.clipboard.writeText(filteredFormatted);
    setTitle('');
    setCity('');
    setArticle('');
    setEditIndex(null);
  };

  const forbiddenWordStyle = {
    backgroundColor: '#FFCCCC',
    fontWeight: 'bold',
  };

  const handleCopyCategory = (category) => {
    const articlesToCopy = savedArticles.filter(
      (article) => article.category === category
    );
    const formattedCategory = articlesToCopy
      .map((article) => article.content)
      .join('\n');
    navigator.clipboard.writeText(formattedCategory);
    alert(`Статьи из категории "${category}" скопированы в буфер обмена!`);
  };

  const handleEditArticle = (index) => {
    const articleToEdit = savedArticles[index];
    setTitle(articleToEdit.title);
    setCity('');
    setArticle(articleToEdit.content);
    setSelectedCategory(articleToEdit.category);
    setEditIndex(index);
  };

  return (
    <Box p={3}>
      <Typography variant='h4'>Format</Typography>
      <Box mt={3}>
        <Typography variant='h5'>Категории:</Typography>
        <Box display='flex' flexWrap='wrap' mt={1}>
          {categories.map((category, index) => (
            <Button
              key={index}
              variant={selectedCategory === category ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => setSelectedCategory(category)}
              style={{ marginRight: '10px', marginBottom: '10px' }}
            >
              {category} ({categoryCounts[category]})
            </Button>
          ))}
        </Box>
      </Box>
      <Box mt={2}>
        <TextField
          label='Заголовок'
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Box>
      <Box mt={2}>
        <TextField
          label='Город (источник новости)'
          fullWidth
          value={city}
          onChange={(e) => setCity(e.target.value.toUpperCase())}
        />
      </Box>
      <Box mt={2}>
        <TextField
          label='Статья'
          fullWidth
          multiline
          rows={10}
          value={article}
          onChange={(e) => setArticle(e.target.value)}
        />
      </Box>
      <Box mt={2}>
        <Button
          variant='contained'
          color='primary'
          onClick={handleFormatAndSave}
          disabled={!selectedCategory || containsForbiddenWords}
        >
          {editIndex !== null ? 'SAVE' : 'FORMAT & SAVE'}
        </Button>
      </Box>
      {selectedCategory && savedArticles.length > 0 && (
        <Box mt={3}>
          <Typography variant='h5'>
            Статьи в выбранной категории "{selectedCategory}":
          </Typography>
          <List>
            {savedArticles.map(
              (article, index) =>
                article.category === selectedCategory && (
                  <ListItem key={index}>
                    <ListItemText primary={article.title} />
                    <IconButton
                      aria-label='Edit'
                      onClick={() => handleEditArticle(index)}
                    >
                      <EditIcon />
                    </IconButton>
                  </ListItem>
                )
            )}
          </List>
          <Button
            variant='outlined'
            color='primary'
            onClick={() => handleCopyCategory(selectedCategory)}
            disabled={
              savedArticles.filter(
                (article) => article.category === selectedCategory
              ).length === 0
            }
          >
            COPY CATEGORY
          </Button>
        </Box>
      )}
      <Box mt={2}>
        <Button
          variant='contained'
          color='secondary'
          onClick={() => setSavedArticles([])}
        >
          Clear All Categories
        </Button>
      </Box>
    </Box>
  );
}

export default App;
