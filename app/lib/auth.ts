export async function logout() {
    try {
        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
        });
        window.location.href = "/";
    } catch (error) {
        console.error("Logout failed:", error);
    }
}
