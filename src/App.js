import React, { useState, useEffect, useMemo } from 'react';
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
import DeleteIcon from '@mui/icons-material/Delete';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function App() {
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [article, setArticle] = useState('');
  const [savedArticles, setSavedArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [containsForbiddenWords, setContainsForbiddenWords] = useState(false);

  const categories = useMemo(
    () => [
      'Главные',
      'Инциденты',
      'Культура',
      'Интересное',
      'Мировые',
      'Экономика',
      'Спорт',
    ],
    []
  );

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
  }, [categories, savedArticles]);

  useEffect(() => {
    const forbiddenWordsRegex = /укринформ|читайте также:/i;
    const isForbiddenWordExist = forbiddenWordsRegex.test(article);
    setContainsForbiddenWords(isForbiddenWordExist);
  }, [article]);

  const handleFormatAndSave = () => {
    if (!selectedCategory) {
      alert('Выберите категорию для сохранения статьи!');
      return;
    }

    const lines = article.split('\n');
    const formattedArticle = lines
      .map((line, index) => {
        if (containsForbiddenWords) {
          return `<span style="color: red;">${line}</span>`;
        }
        return index === 0 ? line : line.replace(/^\s*/, '   ');
      })
      .join('\n');

    const filteredFormatted = formattedArticle
      .split('\n')
      .filter((line) => line.trim() !== '')
      .join('\n');

    const newArticle = {
      category: selectedCategory,
      title: title,
      city: city,
      article: filteredFormatted,
    };

    if (editIndex !== null) {
      const updatedArticles = [...savedArticles];
      updatedArticles[editIndex] = newArticle;
      setSavedArticles(updatedArticles);
    } else {
      setSavedArticles([...savedArticles, newArticle]);
    }

    setTitle('');
    setCity('');
    setArticle('');
    setEditIndex(null);
  };

  const handleCopyCategory = (category) => {
    const articlesToCopy = savedArticles.filter(
      (article) => article.category === category
    );

    const formattedCategory = articlesToCopy
      .map((article) => {
        const formatted = article.article
          .split('\n')
          .map((line, index) => (index === 0 ? line : line.replace(/^\s*/, '   ')))
          .join('\n');
        return ` -PAGE-\n${article.title}\n${article.city} (Unian) - ${formatted}\n -END-\n`;
      })
      .join('\n');

    navigator.clipboard.writeText(formattedCategory);
    alert(`Статьи из категории "${category}" скопированы в буфер обмена!`);
  };

  const handleEditArticle = (index) => {
    const articleToEdit = savedArticles[index];
    setTitle(articleToEdit.title);
    setCity(articleToEdit.city);
    setArticle(articleToEdit.article);
    setSelectedCategory(articleToEdit.category);
    setEditIndex(index);
  };

  const handleDeleteArticle = (index) => {
    const updatedArticles = [...savedArticles];
    updatedArticles.splice(index, 1);
    setSavedArticles(updatedArticles);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const articles = [...savedArticles];
    const [removed] = articles.splice(result.source.index, 1);
    articles.splice(result.destination.index, 0, removed);
    setSavedArticles(articles);
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
          sx={{
            '& span': {
              color: 'red',
            },
          }}
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
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box mt={3}>
            <Typography variant='h5'>
              Статьи в выбранной категории "{selectedCategory}":
            </Typography>
            <Droppable droppableId='articles'>
              {(provided) => (
                <List {...provided.droppableProps} ref={provided.innerRef}>
                  {savedArticles.map(
                    (article, index) =>
                      article.category === selectedCategory && (
                        <Draggable
                          key={index}
                          draggableId={String(index)}
                          index={index}
                        >
                          {(provided) => (
                            <ListItem
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <ListItemText primary={article.title} />
                              <IconButton
                                aria-label='Edit'
                                onClick={() => handleEditArticle(index)}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                aria-label='Delete'
                                onClick={() => handleDeleteArticle(index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItem>
                          )}
                        </Draggable>
                      )
                  )}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
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
        </DragDropContext>
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
