export function SectionHeading({
  id,
  title,
  description,
}: {
  id: string
  title: string
  description?: string
}) {
  return (
    <div className="max-w-2xl">
      <h2
        id={id}
        className="text-3xl font-semibold tracking-tight text-foreground"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  )
}
