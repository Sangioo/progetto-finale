<template>
  <footer
    class="mt-auto border-t-4 border-mint-leaf dark:border-dark-mint-leaf bg-evergreen dark:bg-dark-evergreen text-alabaster-grey dark:text-dark-alabaster-grey shadow-footer pt-8 pb-4 px-0 tablet:pt-12 tablet:pb-6 tablet:px-0">
    <div class="my-0 mx-auto max-w-300 py-0 px-4">
      <div
        class="flex flex-col flex-wrap text-center items-center justify-between gap-4 tablet:flex-row tablet:text-left tablet:gap-8">
        <div class="flex flex-col grow shrink basis-1/10">
          <div>
            <NuxtLink to="/"
              class="group inline-block text-xl font-extrabold tracking-tight text-alabaster-grey dark:text-dark-alabaster-grey no-underline mobiles:text-2xl mobilel:text-4xl">
              Frame<span
                class="text-mint-leaf dark:text-dark-mint-leaf transition-colors duration-300 group-hover:text-alabaster-grey dark:group-hover:text-dark-alabaster-grey">Log</span>
            </NuxtLink>
          </div>
          <p
            class="mt-2 mb-0 mx-auto max-w-70 text-muted-teal dark:text-dark-muted-teal text-sm tablet:text-base tablet:mt-4 tablet:mx-0 tablet:max-w-85">
            Il tuo spazio per raccontare e organizzare il tuo cinema.
          </p>
        </div>

        <div class="flex grow-0 shrink basis-auto">
          <ul class="m-0 p-0 flex list-none flex-wrap gap-y-2 gap-x-4 justify-center mobilel:gap-4 tablet:gap-6">
            <li>
              <NuxtLink to="/"
                class="relative pb-1 font-semibold text-sm text-alabaster-grey dark:text-dark-alabaster-grey no-underline transition-colors duration-300 after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:rounded-xs after:bg-mint-leaf after:transition-width after:duration-300 hover:text-mint-leaf dark:hover:text-dark-mint-leaf hover:after:w-full mobilel:text-base">
                Home</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/profile"
                class="relative pb-1 font-semibold text-sm text-alabaster-grey dark:text-dark-alabaster-grey no-underline transition-colors duration-300 after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:rounded-xs after:bg-mint-leaf after:transition-width after:duration-300 hover:text-mint-leaf dark:hover:text-dark-mint-leaf hover:after:w-full mobilel:text-base">
                Profile</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/watchlist"
                class="relative pb-1 font-semibold text-sm text-alabaster-grey dark:text-dark-alabaster-grey no-underline transition-colors duration-300 after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:rounded-xs after:bg-mint-leaf after:transition-width after:duration-300 hover:text-mint-leaf dark:hover:text-dark-mint-leaf hover:after:w-full mobilel:text-base">
                Watchlist</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/watched"
                class="relative pb-1 font-semibold text-sm text-alabaster-grey dark:text-dark-alabaster-grey no-underline transition-colors duration-300 after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:rounded-xs after:bg-mint-leaf after:transition-width after:duration-300 hover:text-mint-leaf dark:hover:text-dark-mint-leaf hover:after:w-full mobilel:text-base">
                Watched</NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>
