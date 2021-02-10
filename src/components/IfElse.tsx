type Props<T> = {
  predicate: T
  children: (pred: NonNullable<Props<T>['predicate']>) => JSX.Element | null
  placeholder?: JSX.Element | null
}

export default function IfElse<T>({
  predicate,
  children,
  placeholder,
}: Props<T>): JSX.Element | null {
  return predicate ? children(predicate as NonNullable<T>) : placeholder || null
}
