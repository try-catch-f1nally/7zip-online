export default interface Database {
  connect(): Promise<void>;
  close(): Promise<void>;
}
