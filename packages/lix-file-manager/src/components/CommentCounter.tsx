interface CommentCounterProps {
	count: number;
	onClick?: () => void;
}

export const CommentCounter: React.FC<CommentCounterProps> = ({
	count,
	onClick,
}) => (
	<button
		onClick={onClick}
		className="flex justify-center items-center h-8 gap-0.5 rounded-md text-[#8c9aad]"
	>
		<span className="text-sm font-medium">{count}</span>
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="w-6 h-6"
		>
			<path
				d="M9.6 20C9.38783 20 9.18434 19.9157 9.03431 19.7657C8.88429 19.6157 8.8 19.4122 8.8 19.2V16.8H5.6C5.17565 16.8 4.76869 16.6314 4.46863 16.3314C4.16857 16.0313 4 15.6243 4 15.2V5.6C4 5.17565 4.16857 4.76869 4.46863 4.46863C4.76869 4.16857 5.17565 4 5.6 4H18.4C18.8243 4 19.2313 4.16857 19.5314 4.46863C19.8314 4.76869 20 5.17565 20 5.6V15.2C20 15.6243 19.8314 16.0313 19.5314 16.3314C19.2313 16.6314 18.8243 16.8 18.4 16.8H13.52L10.56 19.768C10.4 19.92 10.2 20 10 20H9.6ZM10.4 15.2V17.664L12.864 15.2H18.4V5.6H5.6V15.2H10.4ZM7.2 8H16.8V9.6H7.2V8ZM7.2 11.2H14.4V12.8H7.2V11.2Z"
				fill="currentColor"
			/>
		</svg>
	</button>
);
