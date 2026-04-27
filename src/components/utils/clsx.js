export default function clsx(...values) {
  return values.filter(Boolean).join(" ");
}
