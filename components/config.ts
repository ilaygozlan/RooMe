// Backward compatibility layer for existing imports: import API from "../config"
// This exports the API base URL with a trailing slash for easy endpoint concatenation
import { ENV } from "../src/config/env";

// Ensure trailing slash for easy endpoint concatenation
const API_BASE = ENV.apiBaseUrl.endsWith("/") ? ENV.apiBaseUrl : `${ENV.apiBaseUrl}/`;

export default API_BASE;

