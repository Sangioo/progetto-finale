<script setup></script>

<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-row">
        <div class="footer-brand-col">
          <router-link to="/" class="footer-brand">
            Frame<span class="brand-dot">Log</span>
          </router-link>
          <p class="footer-note">Il tuo spazio per raccontare e organizzare il tuo cinema.</p>
        </div>

        <div class="footer-nav-col">
          <ul class="footer-nav">
            <li class="nav-item">
              <router-link to="/" class="footer-link">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/profile" class="footer-link">Profile</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/watchlist" class="footer-link">Watchlist</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/watched" class="footer-link">Watched</router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--evergreen);
  border-top: 4px solid var(--mint-leaf);
  box-shadow: 0 -4px 20px rgba(74, 189, 140, 0.05);
  color: var(--alabaster-grey);
  padding: 3rem 0 1.5rem 0;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.footer-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.footer-brand-col {
  flex: 1 1 10%;
}

.footer-nav-col {
  flex: 0 1 auto;
}

.footer-brand {
  color: var(--alabaster-grey);
  font-size: 2.2rem;
  font-weight: 800;
  text-decoration: none;
  letter-spacing: -0.5px;
  transition: var(--transition-standard);
  display: inline-block;
}

.brand-dot {
  color: var(--mint-leaf);
  transition: var(--transition-standard);
}

.footer-brand:hover {
  color: var(--alabaster-grey);
}

.footer-brand:hover .brand-dot {
  color: var(--alabaster-grey);
}

.footer-note {
  color: var(--muted-teal);
  max-width: 340px;
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
  line-height: 1.5;
}

.footer-nav {
  display: flex;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
}

.footer-link {
  position: relative;
  color: var(--alabaster-grey);
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: color 0.3s ease;
  padding-bottom: 4px;
}

.footer-link::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: var(--mint-leaf);
  transition: width 0.3s ease;
  border-radius: 2px;
}

.footer-link:hover {
  color: var(--mint-leaf);
}

.footer-link:hover::after {
  width: 100%;
}

@media (max-width: 768px) {
  .footer {
    padding: 2rem 0 1rem 0;
  }

  .footer-row {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .footer-note {
    margin: 0.5rem auto 0 auto;
    font-size: 0.9rem;
  }

  .footer-nav {
    justify-content: center;
    gap: 1rem;
  }
}

@media (max-width: 425px) {
  .footer {
    padding: 1.25rem 0 0.75rem 0;
  }

  .footer-container {
    padding: 0 1rem;
  }

  .footer-brand {
    font-size: 1.4rem;
  }

  .footer-note {
    font-size: 0.8rem;
    line-height: 1.3;
    max-width: 280px;
  }

  .footer-nav {
    flex-direction: row;
    justify-content: center;
    gap: 0.5rem 1rem;
  }

  .footer-link {
    font-size: 0.85rem;
  }
}

@media (max-width: 320px) {
  .footer-brand {
    font-size: 1.25rem;
  }

  .footer-link {
    font-size: 0.8rem;
  }
}
</style>
