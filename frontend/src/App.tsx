import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

const GET_BOOKS = gql`
  query GetBooks {
    books {
      title
      author
    }
  }
`;

type Book = {
	id: string;
	title: string;
	author: string;
};

type GetBooksQuery = {
	books: Book[];
};

function DisplayBooks() {
	const { loading, error, data } = useQuery<GetBooksQuery>(GET_BOOKS);

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error : {error.message}</p>;

	return data?.books.map(book => (
		<div key={book.title}>
			<h3>{book.title}</h3>
			<p>{book.author}</p>
			<br />
		</div>
	));
}

export function App() {
	return (
		<div>
			<h2>My first Apollo app 🚀</h2>
			<DisplayBooks />
		</div>
	);
}
