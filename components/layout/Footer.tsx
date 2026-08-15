// components/Footer.tsx
export default function Footer({ message }: { message: string }) {
	return (
		<footer className="bg-gray-100 py-6 h-14 flex items-center justify-center">
			<p className="text-gray-600 text-sm">
				© 2025 {message}
			</p>
		</footer>
	);
}
