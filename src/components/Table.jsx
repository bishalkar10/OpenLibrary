import React, { useState, useEffect } from 'react';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';
import TableSortLabel from '@mui/material/TableSortLabel';

export default function Table() {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState('asc'); // filter by ascending or descending
  const [orderBy, setOrderBy] = useState('title'); // filter array basis on which element? title? author name? 

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0) // Reset to first page
  };

  const sortBooks = (books, comparator) => {
    return books.slice().sort(comparator); // keep the original array intact
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)
      : (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1);
  };

  // Filter out null values before joining with commas
  const formatArray = (arr) => arr?.filter(item => item !== null).join(", ");

  useEffect(() => {
    const fetchSubjects = async (path) => {
      try {
        const res = await fetch(`${path}.json`);
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        return data.subjects; // array of subjects
      } catch (error) {
        console.error(`Failed to fetch subjects for path ${path}:`, error);
        return []; // Return an empty array as fallback
      }
    };

    const fetchAuthorDetails = async (name) => {
      try {
        const res = await fetch(`/search/authors.json?q=${name}`);
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        return {
          authorBirthDate: data.docs[0]?.birth_date?.slice(-4) || null, // get the last 4 character of the data which is the year. This will help with sorting
          authorTopWork: data.docs[0]?.top_work || null,
        };
      } catch (error) {
        console.error(`Failed to fetch author details for name ${name}:`, error);
        return {
          authorBirthDate: null,
          authorTopWork: null,
        }; // Return fallback values
      }
    };

    const fetchData = async (callback) => {
      setLoading(true)
      try {
        const res = await fetch("/people/mekBot/books/want-to-read.json");
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();

        const array = await Promise.all(data.reading_log_entries.map(async item => {
          const title = item.work.title;
          const first_publish_year = item.work.first_publish_year;
          const authors = item.work.author_names;

          const [authorDetails, subjects] = await Promise.all([
            Promise.all(authors.map(async (name) => await fetchAuthorDetails(name))),
            fetchSubjects(item.work.key)
          ]);

          return {
            title: title,
            firstPublishYear: first_publish_year,
            subjects: subjects,
            authorNames: authors,
            authorTopWorks: authorDetails.map(item => item.authorTopWork),
            authorBirthDates: authorDetails.map(item => item.authorBirthDate)
          };
        }));
        console.log(array)
        callback(array);
      } catch (error) {
        console.error("Failed to fetch books data:", error);
        callback([]); // Return an empty array as fallback
      } finally {
        setLoading(false); // Set loading to false whether the fetch succeeds or fails
      }
    };
    fetchData(setBooks)
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div> 
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>
              <TableSortLabel
                active={orderBy === 'title'}
                direction={orderBy === 'title' ? order : 'asc'}
                onClick={() => handleRequestSort('title')}
              >
                Title
              </TableSortLabel>
            </th>
            <th>
              <TableSortLabel
                active={orderBy === 'firstPublishYear'}
                direction={orderBy === 'firstPublishYear' ? order : 'asc'}
                onClick={() => handleRequestSort('firstPublishYear')}
              >
                First Publish Year
              </TableSortLabel>
            </th>
            <th>
              <TableSortLabel
                active={orderBy === 'subjects'}
                direction={orderBy === 'subjects' ? order : 'asc'}
                onClick={() => handleRequestSort('subjects')}
              >
                Subject
              </TableSortLabel>
            </th>
            <th>
              <TableSortLabel
                active={orderBy === 'authorNames'}
                direction={orderBy === 'authorNames' ? order : 'asc'}
                onClick={() => handleRequestSort('authorNames')}
              >
                Author Name
              </TableSortLabel>
            </th>
            <th>
              <TableSortLabel
                active={orderBy === 'authorBirthDates'}
                direction={orderBy === 'authorBirthDates' ? order : 'asc'}
                onClick={() => handleRequestSort('authorBirthDates')}
              >
                Author Birth Datedd
              </TableSortLabel>
            </th>
            <th>
              <TableSortLabel
                active={orderBy === 'authorTopWorks'}
                direction={orderBy === 'authorTopWorks' ? order : 'asc'}
                onClick={() => handleRequestSort('authorTopWorks')}
              >
                Author Top Work
              </TableSortLabel>
            </th>
          </tr>
        </thead>

        <tbody>
          {sortBooks(books, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((book, index) => (
            <tr key={index}>
              <td>{book.title}</td>
              <td>{book.firstPublishYear}</td>
              <td>{formatArray(book.subjects)}</td>
              <td>{formatArray(book.authorNames)}</td>
              <td>{formatArray(book.authorBirthDates)}</td>
              <td>{formatArray(book.authorTopWorks)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>


      <TablePagination
        sx={{ display: "flex", justifyContent: "center", backgroundColor: "#212529", color: "white"  }}
        component="div"
        count={books.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 50, 100]}
      />
    </div>
  );
};

